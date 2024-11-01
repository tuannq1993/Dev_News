import { gql } from "graphql-request";
import sortNewsByImage from "./sortNewsByImage";

// Dữ liệu giả mô phỏng phản hồi từ API
const mockNewsData = {
  data: {
    myQuery: {
      data: [
        {
          author: "John Doe",
          category: "general",
          country: "us",
          description: "This is a mock description for a news article.",
          image: "https://via.placeholder.com/150",
          language: "en",
          published_at: "2024-10-15T10:00:00Z",
          source: "Mock Source",
          title: "Mock News Article Title",
          url: "https://example.com/mock-news-article",
        },
        {
          author: "Jane Smith",
          category: "technology",
          country: "us",
          description: "This is another mock description for a tech news article.",
          image: "https://via.placeholder.com/150",
          language: "en",
          published_at: "2024-10-16T10:00:00Z",
          source: "Mock Source 2",
          title: "Another Mock News Title",
          url: "https://example.com/another-mock-news",
        },
        // Thêm các bản tin giả khác nếu cần
      ],
      pagination: {
        count: 2,
        limit: 10,
        offset: 0,
        total: 2,
      },
    },
  },
};

// Hàm fetchNews để lấy dữ liệu từ API hoặc dùng dữ liệu giả khi thiếu API key
const fetchNews = async (
  category?: string,
  keywords?: string,
  isDynamic?: boolean
) => {
  // Kiểm tra sự tồn tại của API key, nếu không có, sử dụng dữ liệu giả
  if (!process.env.STEPZEN_API_KEY || !process.env.MEDIASTACK_API_KEY) {
    console.log("Sử dụng dữ liệu giả vì thiếu API key");
    return sortNewsByImage(mockNewsData.data.myQuery);
  }

  // GraphQL Query
  const query = gql`
    query MyQuery($access_key: String!, $categories: String!, $keywords: String) {
      myQuery(
        access_key: $access_key
        categories: $categories
        countries: "in, us"
        sort: "published_desc"
        keywords: $keywords
      ) {
        data {
          author
          category
          country
          description
          image
          language
          published_at
          source
          title
          url
        }
        pagination {
          count
          limit
          offset
          total
        }
      }
    }
  `;

  // Fetch Data từ API
  const res = await fetch("https://luisantonio.stepzen.net/api/solid-olm/__graphql", {
    method: "POST",
    next: isDynamic ? { revalidate: 30 } : { revalidate: 180 },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Apikey ${process.env.STEPZEN_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      variables: {
        access_key: process.env.MEDIASTACK_API_KEY,
        categories: category || "general",
        keywords: keywords,
      },
    }),
  });

  const newsResponse = await res.json();
  let news = newsResponse;
  if (newsResponse.data.myQuery !== null) {
    news = sortNewsByImage(newsResponse.data.myQuery);
  }

  return news;
};

export default fetchNews;
