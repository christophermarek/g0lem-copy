export const defaultImageUrl =
  'https://firebasestorage.googleapis.com/v0/b/g0lem-b4371.appspot.com/o/profilePictures%2FlogoNoHat.png?alt=media&token=1b5af575-533d-4dd5-be03-c6454e90ba75';

export const camelToTitle = (camelCase: string) =>
  camelCase
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
