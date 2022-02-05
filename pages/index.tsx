import type { NextPage } from "next";
import Head from "next/head";
import { createClient } from "@supabase/supabase-js";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ReplyIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, XIcon } from "@heroicons/react/outline";

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
                  <div className="flex items-center justify-start gap-2">
                    <ReplyIcon className="w-4 text-gray-600 rotate-180" />
                    <p className="font-extralight italic text-gray-600 text-sm">
                      {commentList.find((comment) => comment.id === replyOf)?.payload ?? ""}
                    </p>
                  </div>
                  <button onClick={() => setReplyOf(null)} title="Cancel">
                    <XIcon className="w-4 text-gray-600" />
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
                return +aDate - +bDate;
              })
              .map((comment) => (
                <div key={comment.id} className="border rounded-md p-4">
                  {comment.reply_of && (
                    <div className="flex items-center justify-start gap-2">
                      <ReplyIcon className="w-3 text-gray-600 rotate-180" />
                      <p className="font-extralight italic text-gray-600 text-xs">
                        {commentList.find((c) => c.id === comment.reply_of)?.payload ?? ""}
                      </p>
                    </div>
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
                            title="Confirm"
                          >
                            <CheckCircleIcon
                              className={`${
                                editComment.payload === comment.payload ? `text-gray-300` : `text-green-500`
                              } w-6`}
                            />
                          </button>
                          <button type="button" onClick={() => setEditComment({ id: "", payload: "" })} title="Cancel">
                            <XCircleIcon className="w-6 text-gray-600" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditComment({ id: comment.id, payload: comment.payload })}
                            title="Edit comment"
                          >
                            <PencilIcon className="w-6" />
                          </button>
                          <button onClick={() => confirmDelete(comment.id)} title="Delete comment">
                            <TrashIcon className="w-6" />
                          </button>
                          <button onClick={() => setReplyOf(comment.id)} title="Reply to comment">
                            <ReplyIcon className="w-6 rotate-180" />
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
