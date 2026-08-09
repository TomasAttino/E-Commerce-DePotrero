export function isStateVersionBehind(currentVersion: number, expectedVersion: number) {
  return currentVersion < expectedVersion;
}
