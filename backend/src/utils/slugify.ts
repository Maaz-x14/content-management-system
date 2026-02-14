import slugifyLib from 'slugify';

/**
 * Generate URL-friendly slug from text
 * @param text - Text to convert to slug
 * @param options - Slugify options
 * @returns URL-friendly slug
 */
export function generateSlug(text: string, options?: { lower?: boolean; strict?: boolean }): string {
    return slugifyLib(text, {
        lower: options?.lower !== false, // default true
        strict: options?.strict !== false, // default true
        remove: /[*+~.()'"!:@]/g,
    });
}

/**
 * Generate unique slug by appending number if slug exists
 * @param baseSlug - Base slug to make unique
 * @param checkExists - Function to check if slug exists
 * @returns Unique slug
 */
export async function generateUniqueSlug(
    baseSlug: string,
    checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await checkExists(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}
