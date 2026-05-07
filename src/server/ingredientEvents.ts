import sql from "sql-template-tag";
import { many, none } from "@/lib/db/queries";
import {
    IngredientEventPayload,
    IngredientEventRow,
    IngredientFieldValues,
    MUTABLE_INGREDIENT_FIELDS,
} from "@/lib/db/schemas";

export function buildCreatedDiff(values: IngredientFieldValues): IngredientEventPayload {
    const payload: IngredientEventPayload = {};
    for (const field of MUTABLE_INGREDIENT_FIELDS) {
        payload[field] = { before: null, after: values[field] };
    }
    return payload;
}

export function buildUpdatedDiff(
    prev: IngredientFieldValues,
    next: Partial<IngredientFieldValues>,
): IngredientEventPayload {
    const payload: IngredientEventPayload = {};
    for (const field of MUTABLE_INGREDIENT_FIELDS) {
        if (!(field in next)) continue;
        const after = next[field];
        if (after === undefined) continue;
        const before = prev[field];
        if (before === after) continue;
        payload[field] = { before, after };
    }
    return payload;
}

export type RecordIngredientEventInput = {
    ingredientId: string;
    eventType: "created" | "updated";
    actorUserId: string;
    payload: IngredientEventPayload;
};

export async function recordIngredientEvent(input: RecordIngredientEventInput): Promise<void> {
    await none(sql`
        INSERT INTO ingredient_events (
            "ingredientId", "eventType", "actorUserId", "payload"
        ) VALUES (
            ${input.ingredientId},
            ${input.eventType},
            ${input.actorUserId},
            ${JSON.stringify(input.payload)}::jsonb
        )
    `);
}

export async function replayIngredientStateAt(
    ingredientId: string,
    atTimestamp: Date,
): Promise<IngredientFieldValues | null> {
    const events = await many(
        sql`
            SELECT "ingredientEventId", "ingredientId", "eventType",
                   "actorUserId", "occurredAt", "payload"
            FROM ingredient_events
            WHERE "ingredientId" = ${ingredientId}
              AND "occurredAt" <= ${atTimestamp}
            ORDER BY "occurredAt" ASC, "ingredientEventId" ASC
        `,
        IngredientEventRow,
    );
    if (events.length === 0) return null;

    const state: Record<string, string | number | null> = {};
    for (const event of events) {
        for (const [field, diff] of Object.entries(event.payload)) {
            if (diff) state[field] = diff.after;
        }
    }
    return IngredientFieldValues.parse(state);
}
