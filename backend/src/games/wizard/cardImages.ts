import { readdir, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { wizardCardDesignKeys } from "./cards.js";

const imageExtensions = new Set([".gif", ".jpeg", ".jpg", ".png", ".webp"]);

const aliasesByDesignKey: Record<string, string[]> = {
  "joseph-joestar-wizard-jester": ["joseph-joestar"],
  wizard: ["jojo", "giorno", "dio-brando"],
  jester: ["buggy", "luffy", "monkey-d"],
  dragon: ["ichigo"],
  fairy: ["re-zero", "anime"],
  bomb: ["batman"],
  werewolf: ["thorfinn"],
  witch: ["re-zero"],
  vampire: ["bloodvampp", "dio-brando"],
  juggler: ["zorro"],
  cloud: ["morales"]
};

type WizardCardImage = {
  absolutePath: string;
  normalizedName: string;
};

const normalizeDesignName = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getStableIndex = (value: string, length: number) => {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash % length;
};

const listImages = async (root: string): Promise<WizardCardImage[]> => {
  const rootPath = resolve(root);
  const rootStats = await stat(rootPath).catch(() => null);

  if (!rootStats?.isDirectory()) {
    return [];
  }

  const results: WizardCardImage[] = [];
  const pendingDirectories = [rootPath];

  while (pendingDirectories.length) {
    const currentDirectory = pendingDirectories.pop();

    if (!currentDirectory) {
      continue;
    }

    const entries = await readdir(currentDirectory, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = normalize(join(currentDirectory, entry.name));

      if (entry.isDirectory()) {
        pendingDirectories.push(absolutePath);
        continue;
      }

      if (!entry.isFile() || !imageExtensions.has(extname(entry.name).toLowerCase())) {
        continue;
      }

      results.push({
        absolutePath,
        normalizedName: normalizeDesignName(entry.name.replace(extname(entry.name), ""))
      });
    }
  }

  return results.sort((first, second) => first.absolutePath.localeCompare(second.absolutePath));
};

const findByAlias = (images: WizardCardImage[], aliases: string[]) => {
  for (const alias of aliases.map(normalizeDesignName)) {
    const exactMatch = images.find((image) => image.normalizedName === alias);

    if (exactMatch) {
      return exactMatch;
    }

    const partialMatch = images.find(
      (image) => image.normalizedName.includes(alias) || alias.includes(image.normalizedName)
    );

    if (partialMatch) {
      return partialMatch;
    }
  }

  return null;
};

const createUniqueImageAssignments = (images: WizardCardImage[]) => {
  const availableImages = [...images];
  const assignments = new Map<string, WizardCardImage>();

  for (const designKey of wizardCardDesignKeys) {
    if (!availableImages.length) {
      break;
    }

    const normalizedDesignKey = normalizeDesignName(designKey);
    const designAliases = aliasesByDesignKey[normalizedDesignKey] ?? [];
    const kindAliasKey = normalizedDesignKey.split("-").find((part) => aliasesByDesignKey[part]);
    const kindAliases = kindAliasKey ? aliasesByDesignKey[kindAliasKey] ?? [] : [];
    const matchedImage =
      findByAlias(availableImages, [normalizedDesignKey, ...designAliases, ...kindAliases]) ??
      availableImages[getStableIndex(normalizedDesignKey, availableImages.length)];

    if (!matchedImage) {
      continue;
    }

    assignments.set(normalizedDesignKey, matchedImage);
    availableImages.splice(availableImages.indexOf(matchedImage), 1);
  }

  return assignments;
};

export const getWizardCardImagePath = async (root: string, designKey: string) => {
  const normalizedDesignKey = normalizeDesignName(designKey);

  if (!normalizedDesignKey || normalizedDesignKey.length > 120) {
    return null;
  }

  const rootPath = resolve(root);
  const images = await listImages(rootPath);

  if (!images.length) {
    return null;
  }

  const matchedImage = createUniqueImageAssignments(images).get(normalizedDesignKey);

  if (!matchedImage) {
    return null;
  }

  const resolvedImagePath = resolve(matchedImage.absolutePath);

  if (resolvedImagePath !== rootPath && !resolvedImagePath.startsWith(`${rootPath}\\`) && !resolvedImagePath.startsWith(`${rootPath}/`)) {
    return null;
  }

  return resolvedImagePath;
};
