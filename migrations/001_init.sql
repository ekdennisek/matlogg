CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    "userId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" CITEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
    "refreshTokenId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users("userId") ON DELETE CASCADE,
    "tokenHash" TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "revokedAt" TIMESTAMPTZ,
    "replacedByTokenId" UUID REFERENCES refresh_tokens("refreshTokenId"),
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "lastUsedAt" TIMESTAMPTZ
);
CREATE INDEX refresh_tokens_active_idx ON refresh_tokens ("userId") WHERE "revokedAt" IS NULL;

CREATE TABLE ingredients (
    "ingredientId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "barcode" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "energyKcal" NUMERIC,
    "energyKj" NUMERIC,
    "fatG" NUMERIC,
    "saturatedFatG" NUMERIC,
    "carbsG" NUMERIC,
    "sugarsG" NUMERIC,
    "proteinG" NUMERIC,
    "saltG" NUMERIC,
    "fiberG" NUMERIC,
    "createdByUserId" UUID REFERENCES users("userId"),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recipes (
    "recipeId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users("userId") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT TRUE,
    "isPublic" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX recipes_owner_idx ON recipes ("userId", "isDraft", "updatedAt" DESC);
CREATE INDEX recipes_public_idx ON recipes ("isPublic", "updatedAt" DESC) WHERE "isDraft" = FALSE;
CREATE INDEX recipes_search_idx ON recipes USING gin (to_tsvector('simple', "name"));

CREATE TABLE recipe_ingredients (
    "recipeIngredientId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "recipeId" UUID NOT NULL REFERENCES recipes("recipeId") ON DELETE CASCADE,
    "ingredientId" UUID NOT NULL REFERENCES ingredients("ingredientId"),
    "amountGrams" NUMERIC,
    "position" INT NOT NULL
);
CREATE INDEX recipe_ingredients_order_idx ON recipe_ingredients ("recipeId", "position");

CREATE TABLE collections (
    "collectionId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users("userId") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE collection_recipes (
    "collectionId" UUID NOT NULL REFERENCES collections("collectionId") ON DELETE CASCADE,
    "recipeId" UUID NOT NULL REFERENCES recipes("recipeId") ON DELETE CASCADE,
    "addedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY ("collectionId", "recipeId")
);

CREATE TABLE reviews (
    "reviewId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "recipeId" UUID NOT NULL REFERENCES recipes("recipeId") ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES users("userId") ON DELETE CASCADE,
    "rating" SMALLINT NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
    "comment" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE ("recipeId", "userId")
);
