const fs = require('fs');
const Parser = require('rss-parser');
const cheerio = require('cheerio');
const path  = require('path');
const feedParser = new Parser();

const MAX_BLOGS_TO_SHOW_ON_THE_PAGE = 6

async function getBlogsFromMedium () {
    const feed = await feedParser.parseURL('https://medium.com/feed/@nadkarnigaurav');
    if(!feed || feed.items.length === 0) {
        return [];
    }

    const blogs = [];
    for(let item of feed.items) {
        const $ = cheerio.load(item['content:encoded']);
        const imageSrcs = $('img').map((_, img) => $(img).attr('src'))
        const blog = {
            creator: item.creator,
            title: item.title,
            link: item.link,
            publishingDate: item.pubDate,
            image: imageSrcs && imageSrcs.length > 0 ? imageSrcs.get()[0] : undefined,
        }
        blogs.push(blog)
    }
    return blogs;
}

async function updateReadme() {
  let blogs = await getBlogsFromMedium();
  if(!blogs || blogs.length === 0) {
    throw new Error('No Medium Blogs Found')
  }

  const readmePath = path.resolve('./README.md');
  const readmeContent = fs.readFileSync(readmePath, 'utf-8');

  if( blogs.length > MAX_BLOGS_TO_SHOW_ON_THE_PAGE ) {
    blogs = blogs.slice(0, MAX_BLOGS_TO_SHOW_ON_THE_PAGE)
  }

  articles = blogs.map((blog)=> (
    `<div style="display:flex;border:1px solid #C0C0C0;margin:5px;">
        <div style="padding:5px;">
            <img src="${blog.image}" alt="blog image" width="150" height="100">
        </div>
        <div style="padding:5px;">
            <div>
                <a style="color:white;font-weight:bold;" href="${blog.link}" target="_blank">
                    ${blog.title}
                </a>
            </div>
            <div>
                <div>${blog.publishingDate}</div>
            </div>
        </div>
    </div>`
  )).join("");
  
  const articlesWithWrapper = 
        `<div>
    ${articles}
</div>`

  const updatedContent = readmeContent.replace(
    /<!-- BLOG-POSTS-START -->([\s\S]*?)<!-- BLOG-POSTS-END -->/,
    `<!-- BLOG-POSTS-START -->\n${articlesWithWrapper}\n<!-- BLOG-POSTS-END -->`
  );
  fs.writeFileSync(readmePath, updatedContent);
}

module.exports = updateReadme;


