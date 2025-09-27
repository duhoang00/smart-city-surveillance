export type BrandId<K, T> = K & { __brand: T };

export type WithId<T extends { id: unknown }> = Pick<T, "id">;