use std::fmt;
use std::marker::PhantomData;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// A typed identifier for a domain entity of kind `T`.
///
/// `Id<Document>` and `Id<Chunk>` are distinct types at compile time even
/// though both wrap a [`Uuid`] — the phantom type parameter exists purely
/// to prevent passing a document's ID where a chunk's ID is expected. `T`
/// never needs to be constructed and does not appear in the serialized
/// form.
///
/// # Examples
///
/// ```
/// use atlas_domain::Id;
///
/// struct Document;
/// struct Chunk;
///
/// let doc_id: Id<Document> = Id::new();
/// let chunk_id: Id<Chunk> = Id::new();
///
/// // `doc_id` and `chunk_id` are different types — this would not compile:
/// // let _: Id<Document> = chunk_id;
/// assert_ne!(doc_id.to_string(), chunk_id.to_string());
/// ```
pub struct Id<T> {
    value: Uuid,
    marker: PhantomData<fn() -> T>,
}

impl<T> Id<T> {
    /// Generates a new, random (v4) identifier.
    #[must_use]
    pub fn new() -> Self {
        Self { value: Uuid::new_v4(), marker: PhantomData }
    }

    /// Wraps an existing [`Uuid`] as a typed identifier.
    ///
    /// Used when reconstituting an `Id` from a stored or transmitted
    /// value (e.g. a database row, a wire-format message) rather than
    /// generating a fresh one.
    #[must_use]
    pub fn from_uuid(value: Uuid) -> Self {
        Self { value, marker: PhantomData }
    }

    /// Returns the underlying [`Uuid`].
    #[must_use]
    pub fn as_uuid(&self) -> Uuid {
        self.value
    }
}

impl<T> Default for Id<T> {
    fn default() -> Self {
        Self::new()
    }
}

impl<T> Clone for Id<T> {
    fn clone(&self) -> Self {
        *self
    }
}

impl<T> Copy for Id<T> {}

impl<T> PartialEq for Id<T> {
    fn eq(&self, other: &Self) -> bool {
        self.value == other.value
    }
}

impl<T> Eq for Id<T> {}

impl<T> std::hash::Hash for Id<T> {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.value.hash(state);
    }
}

impl<T> fmt::Debug for Id<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Id({})", self.value)
    }
}

impl<T> fmt::Display for Id<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmt::Display::fmt(&self.value, f)
    }
}

impl<T> Serialize for Id<T> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        self.value.serialize(serializer)
    }
}

impl<'de, T> Deserialize<'de> for Id<T> {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        Uuid::deserialize(deserializer).map(Self::from_uuid)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct Marker;

    #[test]
    fn new_ids_are_unique() {
        let a: Id<Marker> = Id::new();
        let b: Id<Marker> = Id::new();
        assert_ne!(a, b);
    }

    #[test]
    fn from_uuid_round_trips() {
        let uuid = Uuid::new_v4();
        let id: Id<Marker> = Id::from_uuid(uuid);
        assert_eq!(id.as_uuid(), uuid);
    }

    #[test]
    fn display_matches_uuid_string() {
        let uuid = Uuid::new_v4();
        let id: Id<Marker> = Id::from_uuid(uuid);
        assert_eq!(id.to_string(), uuid.to_string());
    }

    #[test]
    fn serde_round_trips_as_plain_uuid() {
        let id: Id<Marker> = Id::new();
        let json = serde_json::to_string(&id).unwrap();
        assert_eq!(json, format!("\"{}\"", id.as_uuid()));

        let deserialized: Id<Marker> = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized, id);
    }

    #[test]
    fn copy_and_clone_produce_equal_values() {
        let id: Id<Marker> = Id::new();
        let copied = id;
        let cloned = id.clone();
        assert_eq!(id, copied);
        assert_eq!(id, cloned);
    }
}
