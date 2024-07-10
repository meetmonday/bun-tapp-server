import * as cheerio from "cheerio";
import { XMLParser } from "fast-xml-parser";

export async function suggests(cat, latest) {
  const mc = { apps: 101, games: 135 };
  const lts = latest == 0 ? 1720891520 : latest;

  const res = await fetch(
    `https://trashbox.ru/ajax.php?mycat=${mc[cat]}&action=timeline_more&next_latest=${lts}&tags=android&t_control=1`
  );

  return parseResults(await res.text());
}

export async function search(term) {
  const res = await fetch(
    `https://trashbox.ru/public/search/?string=${encodeURI(term)}`
  );

  return parseResults(await res.text());
}

function parseResults(inputHtml) {
  const $ = cheerio.load(inputHtml);

  let result = [];

  $(".div_topic_cat_content.with_icon").each((i, elem) => {
    const title = $(elem).find(".div_topic_tcapt_content").text().trim();
    const url = $(elem).find(".a_topic_content.icon").attr("href");
    const tags = $(elem)
      .find(".div_topic_cat_tags a")
      .map((i, tag) => $(tag).text().trim())
      .get();
    const nextLatest = $(elem).attr("data-trash-next-latest");
    const imgSrc = $(elem).find(".div_topic_content_icon").attr("src");
    const topicId = parseInt($(elem).attr("data-trash-autoload-item-id"), 10);

    result.push({ topicId, title, tags, url, nextLatest, imgSrc });
  });

  return result;
}

export async function getTopicInfo(topicId) {
  const res = await fetch(`https://trashbox.ru/api_topics/${topicId}`);
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    allowBooleanAttributes: true,
  });
  const data = parseTopicInfo(parser.parse(await res.text()));
  return data;
}

function parseTopicInfo(data) {
  const item = data.rss.channel.item;
  const images = item.enclosure.map((enc) => enc["@_url"]);

  return {
    title: item.title,
    description: item.description,
    images: images,
    catId: item.trashCatId,
    posted: item.trashLatest,
  };
}
