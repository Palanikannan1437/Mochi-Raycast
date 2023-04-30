import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { contents } from 'cheerio/lib/api/traversing';

// const cleanText = (text: string) => {
//   return text.replace(/\u200B/g, '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '\n\n');
// };

const cleanText = (text: string) => {
  return text
    .replace(/\u200B/g, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '  \n')
    .replace(/(^|\n)(.*?)(:)/g, '$1**$2**$3')
};
export type DocData = Map<DocKey, DocItem[]>;

export type DocKey = {
  title: string;
  content: string;
}

export type DocItem = {
  Description: string;
  Command: string;
  Example: string;
}
export const extractTablesData = async (url: string): Promise<DocData> => {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const tables = $('table');
  const data = new Map();

  const sections = [
    { title: "Crypto_Management", content: "crypto.png", keywords: ["see-no-evil", "monkey"] },
    { title: "NFT_Rarity_Ranking_&_Volume", content: "nft.png", keywords: ["see-no-evil", "monkey"] },
    { title: "Server_Administration", content: "server.png", keywords: ["see-no-evil", "monkey"] },
    { title: "Mochi_Telegram_Bot", content: "https://img.freepik.com/free-vector/bitcoin-vector-illustration_1284-23910.jpg?w=2000&t=st=1682244164~exp=1682244764~hmac=8e8535287575e6a925c11ee352a88df6977daf78e0af0ed092d63812f8dc3912", keywords: ["see-no-evil", "monkey"] },
    { title: "User_Engagement", content: "https://img.freepik.com/free-vector/bitcoin-vector-illustration_1284-23910.jpg?w=2000&t=st=1682244164~exp=1682244764~hmac=8e8535287575e6a925c11ee352a88df6977daf78e0af0ed092d63812f8dc3912", keywords: ["see-no-evil", "monkey"] },
    { title: "Feedback_for_our_Mochi", content: "feedback.png", keywords: ["see-no-evil", "monkey"] },
  ];

  tables.each((i, table) => {
    if (i >= sections.length) {
      return;
    }
    const headers = $(table)
      .find('th')
      .map((_, header) => cleanText($(header).text()))
      .get();

    const rows = $(table)
      .find('tr')
      .slice(1)
      .map((_, row) => {
        return [$(row)
          .find('td')
          .map((_, cell) => cleanText($(cell).text()))
          .get()];
      })
      .get();

    const tableData: DocItem[] = rows.map((row) => {
      return headers.reduce((acc: DocItem, header, index) => {
        if (header === "Examples") {
          acc["Example"] = row[index];
        }
        if (header === 'Command' || header === 'Example' || header === 'Description') {
          acc[header] = row[index];
        }
        return acc;
      }, {} as DocItem);
    });

    data.set(sections[i], tableData);
  });

  // data.forEach((value, key) => {
  //   console.log(`Section: ${key}`);
  //   console.log('Items:');
  //   value.forEach((item: DocItem) => {
  //     console.log(`  Description: ${item.Description}`);
  //     console.log(`  Command: ${item.Command}`);
  //     console.log(`  Example: ${item.Example}`);
  //     console.log('');
  //   });
  //   console.log("------------------------");
  // });
  return data;
};
