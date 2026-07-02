import * as bcrypt from 'bcrypt';

export const hash = (key: string) => {
  return bcrypt.hashSync(key, 10);
};

export const compareHash = (key: string, hash: string) => {
  return bcrypt.compareSync(key, hash);
};
