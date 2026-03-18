use chess::{Board, ChessMove, MoveGen, Piece, Square};
use std::str::FromStr;

use crate::models::Evaluation;

pub fn normalize_evaluation_for_white(fen: &str, evaluation: Option<Evaluation>) -> Evaluation {
    let mut evaluation = evaluation.unwrap_or(Evaluation {
        evaluation_type: "cp".to_string(),
        value: 0,
    });

    let turn = fen.split_whitespace().nth(1).unwrap_or("w");
    if turn == "b" {
        evaluation.value = -evaluation.value;
    }

    evaluation
}

pub fn get_opening_move_score(
    best_move: &str,
    played_move: &str,
    evaluation_before: &Evaluation,
    evaluation_after: &Evaluation,
    player_color: &str,
) -> i32 {
    if best_move == played_move {
        return 100;
    }

    let before_value = get_perspective_value(evaluation_before, player_color);
    let after_value = get_perspective_value(evaluation_after, player_color);
    let loss = (before_value - after_value).max(0);

    if loss <= 20 {
        95
    } else if loss <= 50 {
        85
    } else if loss <= 100 {
        75
    } else if loss <= 180 {
        60
    } else if loss <= 300 {
        40
    } else {
        20
    }
}

pub fn apply_uci_move_to_fen(fen: &str, played_move: &str) -> Result<String, String> {
    let board = Board::from_str(fen).map_err(|_| "Nieprawidlowe FEN do analizy".to_string())?;
    let chess_move = parse_uci_move(played_move)?;
    let is_legal = MoveGen::new_legal(&board).any(|legal_move| legal_move == chess_move);

    if !is_legal {
        return Err("Nielegalny ruch do analizy".to_string());
    }

    Ok(board.make_move_new(chess_move).to_string())
}

fn get_perspective_value(evaluation: &Evaluation, player_color: &str) -> i32 {
    let base_value = if evaluation.evaluation_type == "mate" {
        if evaluation.value > 0 {
            100_000 - evaluation.value.abs() * 1_000
        } else {
            -100_000 + evaluation.value.abs() * 1_000
        }
    } else {
        evaluation.value
    };

    if player_color == "white" {
        base_value
    } else {
        -base_value
    }
}

fn parse_uci_move(played_move: &str) -> Result<ChessMove, String> {
    if played_move.len() < 4 {
        return Err("Nielegalny ruch do analizy".to_string());
    }

    let from = Square::from_str(&played_move[0..2])
        .map_err(|_| "Nielegalny ruch do analizy".to_string())?;
    let to = Square::from_str(&played_move[2..4])
        .map_err(|_| "Nielegalny ruch do analizy".to_string())?;

    let promotion = if played_move.len() > 4 {
        match played_move.chars().nth(4) {
            Some('q') => Some(Piece::Queen),
            Some('r') => Some(Piece::Rook),
            Some('b') => Some(Piece::Bishop),
            Some('n') => Some(Piece::Knight),
            _ => return Err("Nielegalny ruch do analizy".to_string()),
        }
    } else {
        None
    };

    Ok(ChessMove::new(from, to, promotion))
}
