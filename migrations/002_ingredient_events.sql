CREATE TABLE ingredient_events (
    "ingredientEventId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ingredientId" UUID NOT NULL REFERENCES ingredients("ingredientId") ON DELETE CASCADE,
    "eventType" TEXT NOT NULL CHECK ("eventType" IN ('created', 'updated')),
    "actorUserId" UUID NOT NULL REFERENCES users("userId"),
    "occurredAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "payload" JSONB NOT NULL
);
CREATE INDEX ingredient_events_replay_idx
    ON ingredient_events ("ingredientId", "occurredAt", "ingredientEventId");
