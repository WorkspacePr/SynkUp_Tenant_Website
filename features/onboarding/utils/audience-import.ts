import type { ImportedAudienceMember } from "@/types/onboarding";

function splitCsvLine(line: string) {
  const values: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && nextCharacter === '"') {
      currentValue += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  values.push(currentValue.trim());
  return values;
}

export async function parseAudienceImportCsv(file: File) {
  const text = await file.text();
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0]).map((header) =>
    header.trim().toLowerCase(),
  );
  const firstNameIndex = headers.indexOf("first_name");
  const surnameIndex =
    headers.indexOf("surname") >= 0
      ? headers.indexOf("surname")
      : headers.indexOf("last_name");
  const fullNameIndex = headers.indexOf("full_name");
  const emailIndex = headers.indexOf("email");
  const identifierIndex = headers.indexOf("identifier");

  return lines.slice(1).flatMap((line, index): ImportedAudienceMember[] => {
    const values = splitCsvLine(line);
    const firstName = values[firstNameIndex] ?? "";
    const surname = values[surnameIndex] ?? "";
    const fullName = values[fullNameIndex] ?? "";
    const email = values[emailIndex] ?? "";
    const identifier = values[identifierIndex]?.trim() ?? "";
    const [fallbackFirstName = "", ...fallbackSurnameParts] = fullName
      .trim()
      .split(/\s+/);
    const normalizedFirstName = firstName.trim() || fallbackFirstName;
    const normalizedSurname =
      surname.trim() || fallbackSurnameParts.join(" ").trim();

    if (!normalizedFirstName && !normalizedSurname) {
      return [];
    }

    return [
      {
        id: `imported-${Date.now()}-${index}`,
        firstName: normalizedFirstName,
        surname: normalizedSurname,
        email: email.trim(),
        identifier,
        status: email.trim() ? "Pending Invite" : "No Email",
        action: identifier ? "Ready to add" : "Needs identifier",
      },
    ];
  });
}
