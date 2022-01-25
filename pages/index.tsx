import type { NextPage } from "next";
import Head from "next/head";
import { createClient } from "@supabase/supabase-js";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL + "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY + "";

export const supabase = createClient(supabaseUrl, supabaseKey);

interface CommentParams {
  id: string;
  created_at: string;
  updated_at: string;
  username: string;
  payload: string;
  reply_of?: string;
}

const Home: NextPage = () => {
  const [comment, setComment] = useState<string>("");
  const [commentList, setCommentList] = useState<CommentParams[]>([]);

  const getCommentList = async () => {
    const { data, error } = await supabase.from("comments").select("*");
    if (!error && data) {
      setCommentList(data);
    } else {
      setCommentList([]);
    }
  };

  useEffect(() => {
    getCommentList();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { data, error } = await supabase.from("comments").insert({
      username: "hoonwee@email.com",
      payload: comment,
    });
    if (!error && data) {
      window.alert("Hooray!");
    } else {
      window.alert(error?.message);
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const commentValue = event.target.value;
    setComment(commentValue);
  };

  return (
    <div>
      <Head>
        <title>Comments Page</title>
      </Head>
      <div className="pt-36 flex justify-center">
        <div className="min-w-[600px]">
          <h1 className="text-4xl font-bold ">Comments</h1>
          <form onSubmit={onSubmit} className="mt-8 flex gap-8">
            <input
              onChange={onChange}
              type="text"
              placeholder="Add a comment"
              className="p-2 border-b focus:border-b-gray-700 w-full outline-none"
            />
            <button className="px-4 py-2 bg-green-500 rounded-lg text-white">
              Submit
            </button>
          </form>
          <div className="flex flex-col gap-4 pt-12">
            {commentList.map((comment) => (
              <div key={comment.id} className="border rounded-md p-4">
                <p className="font-semibold mb-2">{comment.username}</p>
                <p className="font-light">{comment.payload}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
