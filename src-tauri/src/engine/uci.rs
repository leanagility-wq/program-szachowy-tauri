use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::mpsc::{self, Receiver};
use std::time::Duration;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

use crate::chess_logic::normalize_evaluation_for_white;
use crate::models::Evaluation;

fn log_uci(binary_label: &str, message: &str) {
    eprintln!("[uci:{binary_label}] {message}");
}

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

        #[cfg(target_os = "windows")]
        command.creation_flags(0x08000000);

        log_uci(
            config.binary_label,
            &format!(
                "spawn start path={} cwd={}",
                config.binary_path.display(),
                config
                    .binary_path
                    .parent()
                    .map(|dir| dir.display().to_string())
                    .unwrap_or_else(|| "<none>".to_string())
            ),
        );

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

        log_uci(config.binary_label, &format!("spawn ok pid={}", child.id()));

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
                        log_uci(binary_label, &format!("stdout {line}"));
                        if stdout_tx.send(line).is_err() {
                            break;
                        }
                    }
                    Err(error) => {
                        log_uci(binary_label, &format!("stdout read error: {error}"));
                        break;
                    }
                }
            }
        });

        std::thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                match line {
                    Ok(line) => {
                        let trimmed = line.trim();
                        if !trimmed.is_empty() {
                            log_uci(binary_label, &format!("stderr {trimmed}"));
                        }
                    }
                    Err(error) => {
                        log_uci(binary_label, &format!("stderr read error: {error}"));
                        break;
                    }
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
        log_uci(self.binary_label, &format!("stdin {command}"));
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
            match self.child.try_wait() {
                Ok(Some(status)) => {
                    log_uci(
                        self.binary_label,
                        &format!("timeout while waiting for stdout, process exited: {status}"),
                    );
                }
                Ok(None) => {
                    log_uci(
                        self.binary_label,
                        "timeout while waiting for stdout, process still running",
                    );
                }
                Err(error) => {
                    log_uci(
                        self.binary_label,
                        &format!("timeout while waiting for stdout, try_wait error: {error}"),
                    );
                }
            }

            self.kill();
            format!(
                "{}: timeout oczekiwania na odpowiedź silnika",
                self.binary_label
            )
        })
    }

    fn shutdown(&mut self) {
        log_uci(self.binary_label, "shutdown");
        let _ = self.send("quit");
        let _ = self.flush();
        self.kill();
    }

    fn kill(&mut self) {
        log_uci(self.binary_label, "kill");
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
    log_uci(binary_label, "initialize start");
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
            log_uci(binary_label, "initialize ready");
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
    log_uci(
        binary_label,
        &format!(
            "set position fen={fen} search_limit={}",
            describe_search_limit(search_limit)
        ),
    );

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

fn describe_search_limit(search_limit: &SearchLimit) -> String {
    match search_limit {
        SearchLimit::Depth(depth) => format!("depth:{depth}"),
        SearchLimit::MoveTime(ms) => format!("movetime:{ms}"),
    }
}

pub fn run_bestmove(
    config: &UciEngineConfig,
    request: &BestMoveRequest<'_>,
) -> Result<String, String> {
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

pub fn run_multipv(
    config: &UciEngineConfig,
    fen: &str,
    depth: u32,
    count: usize,
) -> Result<Vec<String>, String> {
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
