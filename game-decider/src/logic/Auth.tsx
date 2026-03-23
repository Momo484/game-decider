export const isUsernameUnique = (
  name: string,
  participants: string[],
): boolean => {
  // .some returns true if the name ALREADY exists.
  // We want to return TRUE if it is UNIQUE (not found).
  const alreadyExists = participants.some(
    (p) => p.toLowerCase() === name.toLowerCase().trim(),
  );

  if (alreadyExists) {
    alert("Participant with same name already in lobby");
    return false;
  }

  return true;
};

export const isUsernameValid = (name: string): boolean => {
  if (name.length < 3 || name.length > 16) {
    alert("Username must be between 3 and 16 characters");
    return false;
  }
  return true;
};
