import { Action, ActionPanel, Grid, useNavigation } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { extractTablesData } from "./utils/docs";

import Commands from "./commands";

export default function Command() {
  const { isLoading, data } = usePromise(
    async () => {
      const data = await extractTablesData("https://mochibot.gitbook.io/mochi-bot/functions/list-of-commands");
      return data;
    },
  );

  const { push } = useNavigation();

  return (
    <Grid
      columns={4}
      isLoading={isLoading}
      fit={Grid.Fit.Fill}
      inset={Grid.Inset.Zero}
      filtering={false}
      navigationTitle="Mochi Docs"
      aspectRatio="3/2"
      searchBarPlaceholder="Search Mochi Commands"
    >
      {data && data?.size > 0 && <Grid.Section title="List of Commands New">
        {Array.from(data.entries()).map(([key, items]) => {
          return (
            <Grid.Item title={key.title.split("_").join(" ")} key={key.title} content={key.content} actions={
              <ActionPanel>
                <Action title="Dive In" onAction={() => {
                  push(<Commands section={key.title} items={items} />);
                }} />
              </ActionPanel>
            } />
          )
        })}
      </Grid.Section>
      }
    </Grid>
  );
}

