//! Streaming Engine: a transport-agnostic token stream abstraction.
//!
//! The Runtime Manager's IPC client reads [`atlas_ipc::WorkerResponse::Token`]
//! messages off a Unix socket; a future UI needs those tokens as they
//! arrive, not transport details. This module is the seam between the
//! two — a channel-based stream that the IPC-reading side pushes into
//! and any consumer (a Tauri command, a test, a CLI harness) reads from,
//! without either side knowing about the other.

use std::sync::mpsc;

/// One event in a generation's token stream.
#[derive(Debug, Clone, PartialEq)]
pub enum StreamEvent {
    /// One generated token's text.
    Token(String),
    /// Generation finished successfully.
    Done(GenerationSummary),
    /// Generation failed partway through. No further events follow.
    Error(String),
}

/// Final statistics for a completed generation, as surfaced to stream
/// consumers — a UI-facing subset of `atlas_ipc::GenerationStats`
/// (deliberately not the same type: this module doesn't depend on
/// `atlas-ipc`, keeping the Streaming Engine usable by anything that
/// produces a token stream, not only the IPC adapter).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct GenerationSummary {
    /// Tokens in the input prompt.
    pub prompt_tokens: u32,
    /// Tokens generated.
    pub generated_tokens: u32,
    /// Tokens per second achieved.
    pub tokens_per_second: f64,
}

/// The receiving half of a token stream — implements [`Iterator`] so
/// consumers can `for event in stream { ... }` directly.
pub struct TokenStream {
    receiver: mpsc::Receiver<StreamEvent>,
}

impl Iterator for TokenStream {
    type Item = StreamEvent;

    fn next(&mut self) -> Option<Self::Item> {
        self.receiver.recv().ok()
    }
}

/// The sending half of a token stream, held by whatever is producing
/// events (the IPC client's reader thread, in production; a test
/// harness, in tests).
#[derive(Clone)]
pub struct TokenStreamHandle {
    sender: mpsc::Sender<StreamEvent>,
}

/// A send failed because the receiving [`TokenStream`] was dropped —
/// the consumer stopped listening (e.g. a cancelled UI request). Not a
/// fatal Runtime error; the producer should simply stop producing.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
#[error("token stream receiver has been dropped")]
pub struct StreamClosed;

impl TokenStreamHandle {
    /// Sends a token event.
    ///
    /// # Errors
    ///
    /// Returns [`StreamClosed`] if the receiver has been dropped.
    pub fn send_token(&self, text: String) -> Result<(), StreamClosed> {
        self.sender
            .send(StreamEvent::Token(text))
            .map_err(|_| StreamClosed)
    }

    /// Sends the terminal "generation completed" event. No further
    /// events should be sent on this handle afterward.
    ///
    /// # Errors
    ///
    /// Returns [`StreamClosed`] if the receiver has been dropped.
    pub fn send_done(&self, summary: GenerationSummary) -> Result<(), StreamClosed> {
        self.sender
            .send(StreamEvent::Done(summary))
            .map_err(|_| StreamClosed)
    }

    /// Sends the terminal "generation failed" event. No further events
    /// should be sent on this handle afterward.
    ///
    /// # Errors
    ///
    /// Returns [`StreamClosed`] if the receiver has been dropped.
    pub fn send_error(&self, message: String) -> Result<(), StreamClosed> {
        self.sender
            .send(StreamEvent::Error(message))
            .map_err(|_| StreamClosed)
    }
}

/// Creates a new token stream, returning the producer handle and the
/// consumer iterator.
#[must_use]
pub fn channel() -> (TokenStreamHandle, TokenStream) {
    let (sender, receiver) = mpsc::channel();
    (TokenStreamHandle { sender }, TokenStream { receiver })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn events_are_received_in_send_order() {
        let (handle, stream) = channel();
        handle.send_token("Hello".to_string()).unwrap();
        handle.send_token(", world".to_string()).unwrap();
        handle
            .send_done(GenerationSummary {
                prompt_tokens: 3,
                generated_tokens: 2,
                tokens_per_second: 10.0,
            })
            .unwrap();
        drop(handle);

        let events: Vec<_> = stream.collect();
        assert_eq!(
            events,
            vec![
                StreamEvent::Token("Hello".to_string()),
                StreamEvent::Token(", world".to_string()),
                StreamEvent::Done(GenerationSummary {
                    prompt_tokens: 3,
                    generated_tokens: 2,
                    tokens_per_second: 10.0,
                }),
            ]
        );
    }

    #[test]
    fn error_event_terminates_the_logical_stream() {
        let (handle, stream) = channel();
        handle.send_token("partial".to_string()).unwrap();
        handle.send_error("worker crashed".to_string()).unwrap();
        drop(handle);

        let events: Vec<_> = stream.collect();
        assert_eq!(events.len(), 2);
        assert_eq!(events[1], StreamEvent::Error("worker crashed".to_string()));
    }

    #[test]
    fn sending_after_the_receiver_is_dropped_reports_stream_closed() {
        let (handle, stream) = channel();
        drop(stream);
        let result = handle.send_token("nobody is listening".to_string());
        assert_eq!(result, Err(StreamClosed));
    }

    #[test]
    fn stream_can_be_moved_across_threads() {
        let (handle, stream) = channel();
        let sender_thread = std::thread::spawn(move || {
            handle
                .send_token("from another thread".to_string())
                .unwrap();
        });
        sender_thread.join().unwrap();

        let event = stream.into_iter().next();
        assert_eq!(
            event,
            Some(StreamEvent::Token("from another thread".to_string()))
        );
    }
}
