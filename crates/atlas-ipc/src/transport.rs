use std::io::{BufRead, Write};
use std::os::unix::net::{UnixListener, UnixStream};
use std::path::{Path, PathBuf};

use serde::de::DeserializeOwned;
use serde::Serialize;

/// Transport-level failures — a broken connection, a malformed frame, or
/// a socket-setup problem. Distinct from [`crate::WorkerError`], which is
/// the worker successfully replying "your request failed."
#[derive(Debug, thiserror::Error)]
pub enum IpcError {
    /// The underlying socket I/O failed.
    #[error("IPC I/O error: {0}")]
    Io(#[from] std::io::Error),

    /// A frame could not be parsed as the expected message type.
    #[error("failed to decode IPC message: {0}")]
    Decode(#[from] serde_json::Error),

    /// The connection was closed cleanly by the peer (EOF) while a
    /// message was expected.
    #[error("IPC connection closed by peer")]
    ConnectionClosed,
}

/// Writes one message as a newline-delimited JSON frame and flushes.
///
/// # Errors
///
/// Returns [`IpcError::Io`] if the write fails, or [`IpcError::Decode`]
/// if the message cannot be serialized (only possible for pathological
/// `Serialize` implementations — none of this crate's own types can
/// fail to serialize).
pub fn write_message<W, T>(writer: &mut W, message: &T) -> Result<(), IpcError>
where
    W: Write,
    T: Serialize,
{
    let json = serde_json::to_string(message)?;
    writer.write_all(json.as_bytes())?;
    writer.write_all(b"\n")?;
    writer.flush()?;
    Ok(())
}

/// Reads one newline-delimited JSON frame and decodes it.
///
/// # Errors
///
/// Returns [`IpcError::ConnectionClosed`] if the peer closed the
/// connection (clean EOF) instead of sending a message,
/// [`IpcError::Io`] on a read failure, or [`IpcError::Decode`] if the
/// frame isn't valid JSON for `T`.
pub fn read_message<R, T>(reader: &mut R) -> Result<T, IpcError>
where
    R: BufRead,
    T: DeserializeOwned,
{
    let mut line = String::new();
    let bytes_read = reader.read_line(&mut line)?;
    if bytes_read == 0 {
        return Err(IpcError::ConnectionClosed);
    }
    Ok(serde_json::from_str(line.trim_end())?)
}

/// The Unix domain socket path for one Runtime instance.
///
/// One socket per running Atlas process (not a single well-known path),
/// so that development instances, tests, and a real installed copy never
/// collide. Lives under the OS temp directory rather than requiring
/// `XDG_RUNTIME_DIR` to be set (which isn't guaranteed in every
/// environment this runs in, e.g. some CI/test contexts).
#[must_use]
pub fn socket_path(instance_id: &str) -> PathBuf {
    std::env::temp_dir().join(format!("atlas-inference-{instance_id}.sock"))
}

/// Starts listening on `path` for a single inference-worker connection.
///
/// Removes any stale socket file left over from a previous, uncleanly
/// terminated instance at the same path before binding — a Unix domain
/// socket bind fails with `AddrInUse` if the path already exists, even
/// if nothing is listening on it anymore.
///
/// # Errors
///
/// Returns [`IpcError::Io`] if the stale-file removal or the bind
/// itself fails for a reason other than "file doesn't exist."
pub fn listen(path: &Path) -> Result<UnixListener, IpcError> {
    if path.exists() {
        std::fs::remove_file(path)?;
    }
    Ok(UnixListener::bind(path)?)
}

/// Connects to a worker's listening socket at `path`.
///
/// # Errors
///
/// Returns [`IpcError::Io`] if the socket doesn't exist or the
/// connection is refused — the caller (Runtime Manager) is expected to
/// retry with backoff while the worker process finishes starting up, not
/// treat a first-attempt failure as fatal.
pub fn connect(path: &Path) -> Result<UnixStream, IpcError> {
    Ok(UnixStream::connect(path)?)
}

#[cfg(test)]
mod tests {
    use std::io::{BufReader, Cursor};

    use super::*;
    use crate::protocol::{HealthInfo, WorkerRequest, WorkerResponse};

    #[test]
    fn write_then_read_round_trips_a_message() {
        let mut buffer: Vec<u8> = Vec::new();
        write_message(&mut buffer, &WorkerRequest::HealthCheck).unwrap();

        let mut reader = BufReader::new(Cursor::new(buffer));
        let decoded: WorkerRequest = read_message(&mut reader).unwrap();
        assert!(matches!(decoded, WorkerRequest::HealthCheck));
    }

    #[test]
    fn read_message_on_empty_input_reports_connection_closed() {
        let mut reader = BufReader::new(Cursor::new(Vec::<u8>::new()));
        let result: Result<WorkerRequest, _> = read_message(&mut reader);
        assert!(matches!(result, Err(IpcError::ConnectionClosed)));
    }

    #[test]
    fn multiple_messages_frame_correctly_on_one_stream() {
        let mut buffer: Vec<u8> = Vec::new();
        write_message(&mut buffer, &WorkerRequest::HealthCheck).unwrap();
        write_message(&mut buffer, &WorkerRequest::Shutdown).unwrap();

        let mut reader = BufReader::new(Cursor::new(buffer));
        let first: WorkerRequest = read_message(&mut reader).unwrap();
        let second: WorkerRequest = read_message(&mut reader).unwrap();
        assert!(matches!(first, WorkerRequest::HealthCheck));
        assert!(matches!(second, WorkerRequest::Shutdown));
    }

    #[test]
    fn socket_path_is_unique_per_instance_id() {
        let a = socket_path("instance-a");
        let b = socket_path("instance-b");
        assert_ne!(a, b);
    }

    #[test]
    fn listen_then_connect_over_a_real_unix_socket() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("test.sock");

        let listener = listen(&path).unwrap();
        let client_path = path.clone();
        let client = std::thread::spawn(move || connect(&client_path).unwrap());

        let (mut server_stream, _addr) = listener.accept().unwrap();
        let mut client_stream = client.join().unwrap();

        write_message(&mut client_stream, &WorkerRequest::HealthCheck).unwrap();
        let mut server_reader = BufReader::new(&mut server_stream);
        let received: WorkerRequest = read_message(&mut server_reader).unwrap();
        assert!(matches!(received, WorkerRequest::HealthCheck));

        let response = WorkerResponse::Health(HealthInfo {
            model_loaded: false,
            uptime_ms: 0,
            protocol_version: crate::PROTOCOL_VERSION,
        });
        write_message(&mut server_stream, &response).unwrap();
        let mut client_reader = BufReader::new(&mut client_stream);
        let received_response: WorkerResponse = read_message(&mut client_reader).unwrap();
        assert!(matches!(received_response, WorkerResponse::Health(_)));
    }

    #[test]
    fn listen_removes_a_stale_socket_file() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("stale.sock");
        std::fs::write(&path, b"not a socket").unwrap();

        // Would fail with AddrInUse without the stale-file cleanup.
        let _listener = listen(&path).unwrap();
    }
}
