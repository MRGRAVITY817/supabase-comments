import type { NextPage } from "next";
import Head from "next/head";
import { createClient } from "@supabase/supabase-js";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL + "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY + "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getNumericDate = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const bigHour = (day + month * 12 + year * 365) * 24;

  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const ms = date.getMilliseconds();
  const smallHour = (ms * 0.001 + second + minute * 60 + hour * 3600) / 3600;

  return bigHour + smallHour;
};

interface CommentParams {
  id: string;
  created_at: string;
  updated_at: string;
  username: string;
  payload: string;
  reply_of?: string;
}

interface EditCommentParams {
  id: string;
  payload: string;
}

const Home: NextPage = () => {
  const [comment, setComment] = useState<string>("");
  const [commentList, setCommentList] = useState<CommentParams[]>([]);
  const [editComment, setEditComment] = useState<EditCommentParams>({ id: "", payload: "" });
  const [replyOf, setReplyOf] = useState<string | null>(null);

  const onChangeEditComment = (event: ChangeEvent<HTMLInputElement>) => {
    const payload = event.target.value;
    setEditComment({ ...editComment, payload });
  };

  const confirmEdit = async () => {
    const { data, error } = await supabase
      .from("comments")
      .update({
        payload: editComment.payload,
        updated_at: new Date(),
      })
      .match({ id: editComment.id });
    if (!error && data) {
      window.alert("Edited Comment!");
    } else {
      window.alert(error?.message);
    }
  };

  const confirmDelete = async (id: string) => {
    const ok = window.confirm("Delete comment?");
    if (ok) {
      const { data, error } = await supabase.from("comments").delete().match({ id });
      if (!error && data) {
        window.alert("Deleted Comment :)");
      } else {
        window.alert(error?.message);
      }
    }
  };

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
      reply_of: replyOf,
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
            <div className="w-full">
              {replyOf && (
                <div className="flex gap-4 my-2 items-center justify-start">
                  <p className="text-xs font-extralight italic text-gray-600">
                    Reply of: {commentList.find((comment) => comment.id === replyOf)?.payload ?? ""}
                  </p>
                  <button onClick={() => setReplyOf(null)} className="text-xs font-light text-red-600">
                    Cancel
                  </button>
                </div>
              )}
              <input
                onChange={onChange}
                type="text"
                placeholder="Add a comment"
                className="p-2 border-b focus:border-b-gray-700 w-full outline-none"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-green-500 rounded-lg text-white">
              Submit
            </button>
          </form>
          <div className="flex flex-col gap-4 pt-12">
            {commentList
              .sort((a, b) => {
                const aDate = new Date(a.created_at);
                const bDate = new Date(b.created_at);
                return getNumericDate(aDate) - getNumericDate(bDate);
              })
              .map((comment) => (
                <div key={comment.id} className="border rounded-md p-4">
                  {comment.reply_of && (
                    <p className="font-extralight italic text-gray-600 text-xs">
                      Reply of: {commentList.find((c) => c.id === comment.reply_of)?.payload ?? ""}
                    </p>
                  )}
                  <p className="font-semibold mb-2">
                    {comment.username}
                    {comment.updated_at !== comment.created_at && (
                      <span className="ml-4 text-sm italic font-extralight">edited</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 justify-between">
                    {comment.id === editComment.id ? (
                      <input
                        type="text"
                        value={editComment.payload}
                        onChange={onChangeEditComment}
                        className="pb-1 border-b w-full"
                      />
                    ) : (
                      <p className="font-light">{comment.payload}</p>
                    )}
                    <div className="flex gap-2">
                      {editComment.id === comment.id ? (
                        <>
                          <button
                            type="button"
                            onClick={confirmEdit}
                            disabled={editComment.payload === comment.payload}
                            className={`${
                              editComment.payload === comment.payload ? `text-gray-300` : `text-green-500`
                            }`}
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditComment({ id: "", payload: "" })}
                            className="text-gray-500"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditComment({ id: comment.id, payload: comment.payload })}
                            className="text-green-500"
                          >
                            Edit
                          </button>
                          <button type="button" onClick={() => confirmDelete(comment.id)} className="text-gray-700">
                            Delete
                          </button>
                          <button type="button" onClick={() => setReplyOf(comment.id)} className="text-orange-500">
                            Reply
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
