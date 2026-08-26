export default {
  async fetch(): Promise<Response> {
    return new Response("laestoa\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};
