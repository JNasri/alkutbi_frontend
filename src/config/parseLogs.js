// utils/parseLogs.js

export function parseLogs(logString) {
  const lines = logString.split("\n").filter((line) => line.trim() !== "");
  const logs = [];

  let currentLog = null;

  for (const line of lines) {
    const logEntryStart = line.match(
      /^(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})\s+([a-f0-9-]+)\s+(.*)?$/
    );

    if (logEntryStart) {
      // Push previous complete log
      if (currentLog) logs.push(currentLog);

      currentLog = {
        date: logEntryStart[1],
        time: logEntryStart[2],
        requestId: logEntryStart[3],
        message: logEntryStart[4] || "",
        method: "",
        url: "",
        username: "",
        origin: "",
      };
    } else if (currentLog) {
      const methodMatch = line.match(/^Method:\s+(.*)$/);
      const urlMatch = line.match(/^URL:\s+(.*)$/);
      const usernameMatch = line.match(/^Username:\s+(.*)$/);
      const originMatch = line.match(/^Origin:\s+(.*)$/);

      if (methodMatch) currentLog.method = methodMatch[1];
      if (urlMatch) currentLog.url = urlMatch[1];
      if (usernameMatch) currentLog.username = usernameMatch[1];
      if (originMatch) currentLog.origin = originMatch[1];
    }
  }

  if (currentLog) logs.push(currentLog); // Push last log

  return logs;
}
