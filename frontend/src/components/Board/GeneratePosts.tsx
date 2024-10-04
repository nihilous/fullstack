import { formatDate } from '../../util/formatDate';
import React from 'react';
import { post_for_bbs } from '../../types/BoardType';

interface GeneratePostsProps {
  language: string;
  translations: any;
  posts: post_for_bbs[];
  postNum: number;
  closePost: Function;
  fetchPost: Function;
}

const GeneratePosts = (props: GeneratePostsProps) => {
  const translations = props.translations;
  const language = props.language;
  const posts = props.posts;
  const postNum = props.postNum;
  const closePost = props.closePost;
  const fetchPost = props.fetchPost;

  return (
    <div className={'post'}>
      {posts.map((post_elem: post_for_bbs) => (
        <div
          key={post_elem.id}
          className={`${postNum === post_elem.id ? 'post_elem post_viewing' : 'post_elem '}`}
          onClick={() =>
            postNum === post_elem.id ? closePost() : fetchPost(post_elem.id)
          }
        >
          <span>
            {post_elem.is_admin
              ? translations.admin
              : post_elem.nickname === null
                ? translations.quit
                : post_elem.nickname}
          </span>
          <span>{post_elem.title}</span>
          <span>{formatDate(post_elem.updated_at, language)}</span>
        </div>
      ))}
    </div>
  );
};

export default GeneratePosts;
