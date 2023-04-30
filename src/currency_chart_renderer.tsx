import { Detail } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { getTickerData } from "./tickerRender";


export default function Main() {
  const { isLoading, data } = useCachedPromise(
    async () => {
      const dataurl = await getTickerData()
      return dataurl;
    },
  );

  return (
    <Detail
      isLoading={isLoading}
      markdown={`![graph](${data})`}
      navigationTitle="Pikachu"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Type">
            <Detail.Metadata.TagList.Item text="Electric" color={"#eed535"} />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Separator />
          <Detail.Metadata.Link title="Evolution" target="https://www.pokemon.com/us/pokedex/pikachu" text="Raichu" />
        </Detail.Metadata>
      }
    />
  );
}
