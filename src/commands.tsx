import { Action, ActionPanel, Clipboard, List, showToast } from "@raycast/api";
import { DocItem } from "./utils/docs";

export default function Command({ items }: { items: DocItem[], section: string }) {
  return (
    <List isShowingDetail>
      {items.map((item) => {
        const formattedDescription = "## 💰 " + item.Description + "\n";
        const formattedGif = "![Mochi](https://res.cloudinary.com/ddglxo0l3/image/upload/v1682266903/output-onlinegiftools-4_oghdpq.gif)" + "\n\n";
        const formattedCommand = "### 🚀 Command" + "\n" + item.Command + "\n";
        const formattedExample = item.Example ? "### ⚡ Example" + "\n" + "```\n" + item.Example + "\n```" + "\n\n" : "";
        return (
          <List.Item
            title={item.Description}
            icon={"mochi.png"}
            key={item.Description}
            detail={
              <List.Item.Detail markdown={formattedDescription + formattedExample + formattedGif + formattedCommand} />
            }
            actions={
              <ActionPanel>
                <Action title="Copy Example" onAction={async () => {
                  let clipItem = "";
                  if (item.Example.startsWith("$")) {
                    clipItem = "$" + item.Example.split('$')[1];
                  } else if (item.Example.startsWith("/")) {
                    clipItem = "/" + item.Example.split('/')[1];
                  }
                  await Clipboard.copy(clipItem);
                  await showToast({ title: "Example Copied to Clipboard", message: clipItem });
                }} />
              </ActionPanel>
            }
          />
        )
      })}
    </List>
  );
}
