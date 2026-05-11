"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/Input";
import { Card, Stack } from "@/components/Layout";
import { StarRating } from "@/components/StarRating";
import { Caption, H3 } from "@/components/Typography";
import { upsertReview, ReviewState } from "@/server/reviews";

const initial: ReviewState = { ok: false };

type Props = {
    recipeId: string;
    initialRating: number;
    initialComment: string;
    isEdit: boolean;
};

export function ReviewForm({ recipeId, initialRating, initialComment, isEdit }: Props) {
    const t = useTranslations("recipes.review");
    const tCommon = useTranslations("common");
    const [state, formAction, pending] = useActionState(upsertReview, initial);
    const [rating, setRating] = useState(initialRating);

    return (
        <Card>
            <H3>{isEdit ? t("yourReview") : t("leaveReview")}</H3>
            <form action={formAction}>
                <input type="hidden" name="recipeId" value={recipeId} />
                <Stack gap={3}>
                    <StarRating value={rating} onChange={setRating} name="rating" />
                    {state.fieldErrors?.rating && (
                        <Caption error>{state.fieldErrors.rating[0]}</Caption>
                    )}
                    <Textarea
                        name="comment"
                        placeholder={t("commentPlaceholder")}
                        defaultValue={initialComment}
                        error={state.fieldErrors?.comment?.[0]}
                    />
                    {state.formError && <Caption error>{state.formError}</Caption>}
                    <Button type="submit" disabled={pending || rating === 0} fullWidth>
                        {pending
                            ? tCommon("saving")
                            : isEdit
                              ? t("updateReview")
                              : t("submitReview")}
                    </Button>
                </Stack>
            </form>
        </Card>
    );
}
