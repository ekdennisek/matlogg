import { LinkButton } from "@/components/LinkButton";
import { Card, CardLink, Page, PageHeader, Stack } from "@/components/Layout";
import { Body, Caption, H3 } from "@/components/Typography";
import { getCurrentUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getCurrentUser();
  return (
    <Page>
      <PageHeader title="Matlogg" />
      <Card>
        <H3>Scan a barcode</H3>
        <Body muted>
          Point your camera at a product to look up its nutrients.
        </Body>
        <LinkButton href="/scan" fullWidth>
          Open scanner
        </LinkButton>
      </Card>
      {user ? (
        <Stack gap={3}>
          <CardLink href="/recipes">
            <H3>My recipes & drafts</H3>
            <Caption>
              Continue working on a draft or view your saved recipes.
            </Caption>
          </CardLink>
          <CardLink href="/recipes/browse">
            <H3>Browse public recipes</H3>
            <Caption>Find recipes shared by other users.</Caption>
          </CardLink>
          <CardLink href="/collections">
            <H3>Collections</H3>
            <Caption>Group recipes into your own lists.</Caption>
          </CardLink>
        </Stack>
      ) : (
        <Card>
          <H3>Sign in to do more</H3>
          <Body muted>
            Create recipes, leave reviews, and save collections.
          </Body>
          <Stack gap={2}>
            <LinkButton href="/login" fullWidth>
              Log in
            </LinkButton>
            <LinkButton href="/register" variant="secondary" fullWidth>
              Create account
            </LinkButton>
          </Stack>
        </Card>
      )}
    </Page>
  );
}
