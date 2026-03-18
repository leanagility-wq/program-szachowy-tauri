use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::mpsc::{self, Receiver};
use std::time::Duration;

use crate::chess_logic::normalize_evaluation_for_white;
use crate::models::Evaluation;

pub enum SearchLimit {
    Depth(u32),
    MoveTime(u64),
}

pub struct UciEngineConfig {
    pub binary_path: PathBuf,
    pub binary_label: &'static str,
    pub startup_commands: Vec<String>,
    pub timeout_ms: u64,
}

pub struct BestMoveRequest<'a> {
    pub fen: &'a str,
    pub search_limit: SearchLimit,
    pub elo: Option<u32>,
}

struct UciProcess {
    binary_label: &'static str,
    timeout: Duration,
    child: Child,
    stdin: ChildStdin,
    stdout_rx: Receiver<String>,
}

impl UciProcess {
    fn spawn(config: &UciEngineConfig) -> Result<Self, String> {
        let mut command = Command::new(&config.binary_path);
        if let Some(parent_dir) = config.binary_path.parent() {
            command.current_dir(parent_dir);
        }

        let mut child = command
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|error| {
                format!(
                    "{}: nie udało się uruchomić silnika {}: {error}",
                    config.binary_label,
                    config.binary_path.display()
                )
            })?;

        let stdin = child
            .stdin
            .take()
            .ok_or_else(|| format!("{}: brak dostępu do stdin silnika", config.binary_label))?;
        let stdout = child
            .stdout
            .take()
            .ok_or_else(|| format!("{}: brak dostępu do stdout silnika", config.binary_label))?;
        let stderr = child
            .stderr
            .take()
            .ok_or_else(|| format!("{}: brak dostępu do stderr silnika", config.binary_label))?;

        let (stdout_tx, stdout_rx) = mpsc::channel();
        let binary_label = config.binary_label;

        std::thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines() {
                match line {
                    Ok(line) => {
                        if stdout_tx.send(line).is_err() {
                            break;
                        }
                    }
                    Err(_) => break,
                }
            }
        });

        std::thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines().map_while(Result::ok) {
                let trimmed = line.trim();
                if !trimmed.is_empty() {
                    eprintln!("{binary_label} stderr: {trimmed}");
                }
            }
        });

        Ok(Self {
            binary_label: config.binary_label,
            timeout: Duration::from_millis(config.timeout_ms),
            child,
            stdin,
            stdout_rx,
        })
    }

    fn send(&mut self, command: &str) -> Result<(), String> {
        writeln!(self.stdin, "{command}")
            .map_err(|error| format!("{}: błąd zapisu do stdin: {error}", self.binary_label))
    }

    fn flush(&mut self) -> Result<(), String> {
        self.stdin
            .flush()
            .map_err(|error| format!("{}: błąd flush stdin: {error}", self.binary_label))
    }

    fn receive_line(&mut self) -> Result<String, String> {
        self.stdout_rx.recv_timeout(self.timeout).map_err(|_| {
            self.kill();
            format!(
                "{}: timeout oczekiwania na odpowiedź silnika",
                self.binary_label
            )
        })
    }

    fn shutdown(&mut self) {
        let _ = self.send("quit");
        let _ = self.flush();
        self.kill();
    }

    fn kill(&mut self) {
        let _ = self.child.kill();
    }
}

impl Drop for UciProcess {
    fn drop(&mut self) {
        self.kill();
    }
}

fn initialize_engine(
    process: &mut UciProcess,
    binary_label: &'static str,
    startup_commands: &[String],
) -> Result<(), String> {
    process.send("uci")?;
    process.flush()?;

    let mut uci_ready = false;

    while !uci_ready {
        let line = process.receive_line()?;
        if line.contains("uciok") {
            uci_ready = true;
        }
    }

    for command in startup_commands {
        process
            .send(command)
            .map_err(|error| format!("{binary_label}: błąd konfiguracji silnika: {error}"))?;
    }

    process.send("isready").map_err(|error| {
        format!(
            "{binary_label}: błąd wysyłania komendy isready do silnika: {error}"
        )
    })?;
    process.flush()?;

    loop {
        let line = process.receive_line()?;
        if line.contains("readyok") {
            return Ok(());
        }
    }
}

fn send_position_and_go(
    process: &mut UciProcess,
    binary_label: &'static str,
    fen: &str,
    search_limit: &SearchLimit,
) -> Result<(), String> {
    process.send(&format!("position fen {fen}")).map_err(|error| {
        format!("{binary_label}: błąd ustawiania pozycji dla silnika: {error}")
    })?;

    match search_limit {
        SearchLimit::Depth(depth) => process
            .send(&format!("go depth {depth}"))
            .map_err(|error| format!("{binary_label}: błąd startu analizy: {error}"))?,
        SearchLimit::MoveTime(movetime_ms) => process
            .send(&format!("go movetime {movetime_ms}"))
            .map_err(|error| format!("{binary_label}: błąd startu analizy: {error}"))?,
    }

    process.flush()
}

pub fn run_bestmove(config: &UciEngineConfig, request: &BestMoveRequest<'_>) -> Result<String, String> {
    let mut startup_commands = config.startup_commands.clone();

    if let Some(elo) = request.elo {
        startup_commands.push("setoption name UCI_LimitStrength value true".to_string());
        startup_commands.push(format!("setoption name UCI_Elo value {elo}"));
    }

    let mut process = UciProcess::spawn(config)?;
    initialize_engine(&mut process, config.binary_label, &startup_commands)?;
    send_position_and_go(
        &mut process,
        config.binary_label,
        request.fen,
        &request.search_limit,
    )?;

    loop {
        let line = process.receive_line()?;
        if let Some(best_move_part) = line.split("bestmove ").nth(1) {
            let best_move = best_move_part
                .split_whitespace()
                .next()
                .unwrap_or("")
                .to_string();

            process.shutdown();

            if best_move.is_empty() || best_move == "(none)" {
                return Err(format!("{}: brak odpowiedzi silnika", config.binary_label));
            }

            return Ok(best_move);
        }
    }
}

pub fn run_multipv(config: &UciEngineConfig, fen: &str, depth: u32, count: usize) -> Result<Vec<String>, String> {
    let mut startup_commands = config.startup_commands.clone();
    startup_commands.push(format!("setoption name MultiPV value {count}"));

    let mut process = UciProcess::spawn(config)?;
    initialize_engine(&mut process, config.binary_label, &startup_commands)?;
    send_position_and_go(
        &mut process,
        config.binary_label,
        fen,
        &SearchLimit::Depth(depth),
    )?;

    let mut multipv_moves: Vec<Option<String>> = vec![None; count];

    loop {
        let line = process.receive_line()?;

        if line.starts_with("info ") && line.contains(" multipv ") && line.contains(" pv ") {
            let pv_index = line
                .split(" multipv ")
                .nth(1)
                .and_then(|part| part.split_whitespace().next())
                .and_then(|value| value.parse::<usize>().ok());
            let move_candidate = line
                .split(" pv ")
                .nth(1)
                .and_then(|part| part.split_whitespace().next())
                .map(str::to_string);

            if let (Some(pv_index), Some(move_candidate)) = (pv_index, move_candidate) {
                if (1..=count).contains(&pv_index) {
                    multipv_moves[pv_index - 1] = Some(move_candidate);
                }
            }
        }

        if line.contains("bestmove") {
            process.shutdown();

            let best_moves = multipv_moves
                .into_iter()
                .flatten()
                .filter(|mv| !mv.is_empty() && mv != "(none)")
                .collect::<Vec<_>>();

            if best_moves.is_empty() {
                return Err(format!("{}: brak odpowiedzi silnika", config.binary_label));
            }

            return Ok(best_moves);
        }
    }
}

pub fn run_evaluation(config: &UciEngineConfig, fen: &str, depth: u32) -> Result<Evaluation, String> {
    let mut process = UciProcess::spawn(config)?;
    initialize_engine(&mut process, config.binary_label, &config.startup_commands)?;
    send_position_and_go(
        &mut process,
        config.binary_label,
        fen,
        &SearchLimit::Depth(depth),
    )?;

    let mut last_score: Option<Evaluation> = None;

    loop {
        let line = process.receive_line()?;

        if let Some(score) = parse_score_line(&line) {
            last_score = Some(score);
        }

        if line.contains("bestmove") {
            process.shutdown();
            return Ok(normalize_evaluation_for_white(fen, last_score));
        }
    }
}

fn parse_score_line(line: &str) -> Option<Evaluation> {
    if let Some(score_part) = line.split(" score cp ").nth(1) {
        let value = score_part.split_whitespace().next()?.parse::<i32>().ok()?;
        return Some(Evaluation {
            evaluation_type: "cp".to_string(),
            value,
        });
    }

    if let Some(score_part) = line.split(" score mate ").nth(1) {
        let value = score_part.split_whitespace().next()?.parse::<i32>().ok()?;
        return Some(Evaluation {
            evaluation_type: "mate".to_string(),
            value,
        });
    }

    None
}
