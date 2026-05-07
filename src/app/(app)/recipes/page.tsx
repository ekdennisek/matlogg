import { Button } from "@/components/Button";
import { LinkButton } from "@/components/LinkButton";
import { Card, CardLink, Page, PageHeader, Stack } from "@/components/Layout";
import { Body, Caption, H3 } from "@/components/Typography";
import { createDraft, getMyRecipes } from "@/server/recipes";
import { formatDate } from "@/lib/format";

export default async function MyRecipesPage() {
    const { drafts, saved } = await getMyRecipes();

    return (
        <Page>
            <PageHeader
                title="My recipes"
                actions={
                    <form action={createDraft}>
                        <Button type="submit">New recipe</Button>
                    </form>
                }
            />

            <LinkButton href="/recipes/browse" variant="secondary" fullWidth>
                Browse public recipes
            </LinkButton>

            {drafts.length > 0 && (
                <Stack gap={2}>
                    <H3>Drafts</H3>
                    <Stack gap={2}>
                        {drafts.map((d) => (
                            <CardLink key={d.recipeId} href={`/recipes/drafts/${d.recipeId}`}>
                                <H3>{d.name}</H3>
                                <Caption>Last edited {formatDate(d.updatedAt)}</Caption>
                            </CardLink>
                        ))}
                    </Stack>
                </Stack>
            )}

            <Stack gap={2}>
                <H3>Saved</H3>
                {saved.length === 0 ? (
                    <Card>
                        <Body muted>You haven't saved any recipes yet. Tap "New recipe" to start one.</Body>
                    </Card>
                ) : (
                    <Stack gap={2}>
                        {saved.map((r) => (
                            <CardLink key={r.recipeId} href={`/recipes/${r.recipeId}`}>
                                <H3>{r.name}</H3>
                                <Caption>
                                    {r.isPublic ? "Public" : "Private"} · Updated {formatDate(r.updatedAt)}
                                </Caption>
                            </CardLink>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Page>
    );
}
