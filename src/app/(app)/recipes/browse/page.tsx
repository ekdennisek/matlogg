import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardLink, Page, PageHeader, Row, Stack } from "@/components/Layout";
import { Body, Caption, H3 } from "@/components/Typography";
import { searchPublicRecipes } from "@/server/recipes";
import { formatDate } from "@/lib/format";

type Props = {
    searchParams: Promise<{ q?: string; sort?: "recent" | "rating" }>;
};

export default async function BrowsePage({ searchParams }: Props) {
    const params = await searchParams;
    const q = params.q ?? "";
    const sort = params.sort === "rating" ? "rating" : "recent";
    const recipes = await searchPublicRecipes({ q, sort });

    return (
        <Page>
            <PageHeader title="Browse public recipes" />

            <form>
                <Stack gap={3}>
                    <Input name="q" placeholder="Search by name" defaultValue={q} />
                    <Row gap={2}>
                        <select
                            name="sort"
                            defaultValue={sort}
                            style={{
                                flex: 1,
                                padding: "var(--space-3)",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--color-border)",
                                minHeight: 44,
                            }}
                        >
                            <option value="recent">Most recent</option>
                            <option value="rating">Highest rated</option>
                        </select>
                        <Button type="submit">Search</Button>
                    </Row>
                </Stack>
            </form>

            {recipes.length === 0 ? (
                <Card>
                    <Body muted>No recipes match your search yet.</Body>
                </Card>
            ) : (
                <Stack gap={2}>
                    {recipes.map((r) => (
                        <CardLink key={r.recipeId} href={`/recipes/${r.recipeId}`}>
                            <H3>{r.name}</H3>
                            <Caption>
                                by {r.authorName} · {formatDate(r.updatedAt)}
                                {r.reviewCount > 0 &&
                                    ` · ★ ${r.avgRating.toFixed(1)} (${r.reviewCount})`}
                            </Caption>
                        </CardLink>
                    ))}
                </Stack>
            )}
        </Page>
    );
}
