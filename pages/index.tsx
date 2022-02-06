import type { NextPage } from "next";
import Head from "next/head";
import { createClient } from "@supabase/supabase-js";
import { ChangeEvent, FormEvent, useState } from "react";
import { ReplyIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, XIcon } from "@heroicons/react/outline";
import useSWR, { mutate } from "swr";

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

const fetcher = (url: string) => fetch(url, { method: "GET" }).then((res) => res.json());

const addCommentRequest = (url: string, data: any) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => res.json());

const editCommentRequest = (url: string, data: any) =>
  fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => res.json());

const deleteCommentRequest = (url: string, id: string) =>
  fetch(`${url}?comment_id=${id}`, { method: "DELETE" }).then((res) => res.json());

const Home: NextPage = () => {
  const { data: commentList, error: commentListError } = useSWR<CommentParams[]>("/api/comments", fetcher);
  const [comment, setComment] = useState<string>("");
  const [editComment, setEditComment] = useState<EditCommentParams>({
    id: "",
    payload: "",
  });
  const [replyOf, setReplyOf] = useState<string | null>(null);

  const onChangeEditComment = (event: ChangeEvent<HTMLInputElement>) => {
    const payload = event.target.value;
    setEditComment({ ...editComment, payload });
  };

  const confirmEdit = async () => {
    const editData = {
      payload: editComment.payload,
      commentId: editComment.id,
    };
    if (typeof commentList !== "undefined") {
      mutate(
        "api/comments",
        commentList.map((comment) => {
          if (comment.id === editData.commentId) {
            return { ...comment, payload: editData.payload };
          }
        }),
        false
      );
      const response = await editCommentRequest("api/comments", editData);
      if (response[0].created_at) {
        mutate("api/comments");
        window.alert("Hooray!");
        setEditComment({ id: "", payload: "" });
      }
    }
  };

  const confirmDelete = async (id: string) => {
    const ok = window.confirm("Delete comment?");
    if (ok && typeof commentList !== "undefined") {
      mutate(
        "api/comments",
        commentList.filter((comment) => comment.id !== id),
        false
      );
      const response = await deleteCommentRequest("api/comments", id);
      if (response[0].created_at) {
        mutate("api/comments");
        window.alert("Deleted Comment :)");
      }
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newComment = {
      username: "hoonwee@email.com",
      payload: comment,
      reply_of: replyOf,
    };
    if (typeof commentList !== "undefined") {
      mutate("api/comments", [...commentList, newComment], false);
      const response = await addCommentRequest("api/comments", newComment);
      if (response[0].created_at) {
        mutate("api/comments");
        window.alert("Hooray!");
        setComment("");
      }
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
                      {commentList?.find((comment) => comment.id === replyOf)?.payload ?? ""}
                    </p>
                  </div>
                  <button onClick={() => setReplyOf(null)} title="Cancel">
                    <XIcon className="w-4 text-gray-600" />
                  </button>
                </div>
              )}
              <input
                onChange={onChange}
                value={comment}
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
            {(commentList ?? [])
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
                        {commentList?.find((c) => c.id === comment.reply_of)?.payload ?? ""}
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
                            onClick={() =>
                              setEditComment({
                                id: comment.id,
                                payload: comment.payload,
                              })
                            }
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
