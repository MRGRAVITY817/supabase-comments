import type { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Comments Page</title>
      </Head>
      <div className="p-12">
        <h1 className="text-2xl font-bold">Comments!</h1>
      </div>
    </div>
  );
};

export default Home;
