'use client';
import React, { useState, useEffect, useMemo } from 'react';
import '../../../css/profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { faPaperPlane, faCamera } from '@fortawesome/free-solid-svg-icons';
// import { fa-circle-camera } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import jwtDecode from 'jwt-decode';
import { useRouter, useParams } from 'next/navigation';
import handleLogout from '@/app/utils/handleLogout';
import Link from 'next/link';
import axios from 'axios';
import setAuthToken from '@/app/utils/setAuthToken';
import Modal from 'react-modal';
import Comment from '@/app/comment/Comment';
import { use } from 'passport';
import moment from 'moment';
import ModalManager from '@/app/post/new/modalManager';
import DropdownSelect from 'react-dropdown-select';


export default function FilterablePostTable() {

    const [data, setData] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [orderOneComplete, setOrderOneComplete] = useState(true);
    const [orderTwoComplete, setOrderTwoComplete] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const router = useRouter();
    const { userId } = useParams();
    const [postId, setPostId] = useState(null);
    const [singlePost, setSinglePost] = useState(null);
    const [comments, setComments] = useState(0);
    const [commentBody, setCommentBody] = useState('');
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [photoUploaded, setPhotoUploaded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    //const [dropdownOptions, setDropdownOptions] = useState([]);
    const [menuOptions, setMenuOptions] = useState([]);


    let posts = [];

    const handleDeletePost = (postId) => {
        console.log('Deleting post with ID:', postId);
        // Check to see if the post exists
        const post = posts.find((post) => post._id === postId);
        console.log('Post found:', post);
        const postIndex = posts.findIndex((post) => post._id === postId);
        if (postIndex !== -1) {
            // Remove the post from the posts array
            const updatedPosts = [...posts];
            updatedPosts.splice(postIndex, 1);
            setPosts(updatedPosts); // Assuming you have a state variable 'posts' and a setter function 'setPosts' to update it.
            setSelectedPostId(null); // Clear the selected post ID
        }

        // Make an API request to delete the post
        if (typeof window !== 'undefined') {
            setAuthToken(localStorage.getItem('jwtToken'));
            axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/posts/post/${postId}`)
                .then((response) => {
                    // Handle the post deletion, for example, remove the deleted post from the data array.
                    posts = posts.filter((post) => post._id !== postId); // Use postId here
                    setSelectedPostId(null); // Clear the selected post ID
                })
                .catch((error) => {
                    console.log('Error deleting post:', error);
                })
                .finally(() => {
                    setIsDeleting(false); // Reset the isDeleting state after the request is complete
                });
        }
    };

    // Define deletePostMenuOptions here
    const deletePost = (postId) => {
        // Make an API request to delete the post
        axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/posts/post/${postId}`)
            .then((response) => {
                // Handle the post deletion, for example, remove the deleted post from the data array.
                posts = posts.filter((post) => post._id !== postId); // Use postId here
                setSelectedPostId(null); // Clear the selected post ID
            })
            .catch((error) => {
                console.log('Error deleting post:', error);
            })
            .finally(() => {
                setIsDeleting(false); // Reset the isDeleting state after the request is complete
            });
    };

    const customStyles = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            overflowY: 'hidden'
        },
        content: {
            width: '1200px',
            height: '75%',
            top: '50%',
            left: '50%',
            right: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            overflow: 'hidden'
        }
    };

    const [isModalManagerOpen, setModalManagerOpen] = useState(false);
    const handleOpenModalManager = () => {
        setModalManagerOpen(true);
    };


    const commentRows = [];

    if (comments.length) {
        comments.forEach((comment) => {
            commentRows.push(<Comment comment={comment} userInfo={loggedInUser} key={comment._id} />);
        });
    } else {
        commentRows.push([]);
    }

    const handleCommentBody = (e) => {
        setCommentBody(e.target.value);
    };

    useEffect(() => {
        setAuthToken(localStorage.getItem('jwtToken'));
        if (orderOneComplete) {
            if (localStorage.getItem('jwtToken')) {
                axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${localStorage.getItem('userId')}`)
                    .then((response) => {
                        setLoggedInUser(response.data.user);
                        let userData = jwtDecode(localStorage.getItem('jwtToken'));
                        if (userData.email === localStorage.getItem('email')) {
                            axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${userId}`)
                                .then((response) => {
                                    setUserInfo(response.data.user);
                                    setLoading(false);
                                    setOrderTwoComplete(true);
                                    // console.log('response.data.user', response.data.user);
                                    const userInfoId = response.data.user._id;
                                    axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/posts/${userInfoId}`)
                                        .then((response) => {
                                            // console.log('response.data.posts', response.data.posts);
                                            setData(response.data.posts.reverse());

                                            // Check if deletePostMenuOptions is already in menuOptions before adding it
                                            setMenuOptions([
                                                {
                                                    label: 'Delete Post',
                                                    action: handleDeletePost,
                                                    isMenuOpen: false,
                                                },
                                            ]);
                                            setOrderOneComplete(false);
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            setTimeout(() => {
                                                router.push('/users/login');
                                            }, 0);
                                        });
                                });
                        } else {
                            setTimeout(() => {
                                router.push('/users/login');
                            }, 0);
                        }
                    });
            } else {
                setTimeout(() => {
                    router.push('/users/login');
                }, 0);
            }
        }
    }, [router, userId, orderOneComplete, loggedInUser]); // Add loggedInUser to the dependencies

    const handleOpenModal = (postId) => {
        setSelectedPostId(postId);
        axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/posts/post/${postId}`)
            .then((response) => {
                // console.log('response.data.post', response.data.post);
                setSinglePost(response.data.post);
                setComments(response.data.post.comments);
            });
        setIsOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedPostId(null);
        setIsOpen(false);
    };

    // const handleAddLike = (postId, userId) => {
    //     axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/posts/${postId}/likes/new`, { userId })
    //         .then(response => {
    //             // console.log('response.data.post', response.data.post);
    //             setSinglePost(response.data.post);
    //         })
    //         .catch(error => console.log('===> Error in Adding like', error));
    // };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (commentBody) {
            const newComment = { createdBy: loggedInUser._id, comment: commentBody };
            axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/posts/${selectedPostId}/comments/new`, newComment)
                .then(response => {
                    // console.log('response.data.post', response.data.post);
                    setCommentBody('');
                    setSinglePost(response.data.post);
                    setComments(response.data.post.comments);

                })
                .catch(error => console.log('===> Error in Adding comment', error));
        } else {
            console.log('need to input something');
        }
    };

    if (isLoading) return <p>Loading...</p>;
    if (!userInfo) return <p>No data shown...</p>;
    if (isDeleting) return <p>Post has been deleted...</p>;

    return (
        <main className="profile-center">
            {orderTwoComplete && (
                <div>
                    <div className="container-profile">
                        <div className="profile">
                            <div className="profile-image">
                                <img
                                    src={userInfo.profilePicture || 'https://freesvg.org/img/abstract-user-flat-4.png'}
                                    alt="Profile Image" className='avatar-img'
                                />
                            </div>

                            <div className="profile-user-settings">
                                {localStorage.getItem('userId') === userId ? (
                                    <div>
                                        <h1 className="profile-user-name">{userInfo.username}</h1>
                                        <a href="/users/edit">
                                            <button className="btn profile-edit-btn">Edit Profile</button>
                                        </a>
                                        <button className="btn profile-settings-btn" aria-label="profile settings">
                                            <FontAwesomeIcon icon={faCog} className="me-2" />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="profile-user-settings">
                                            <h1 className="profile-user-name">{userInfo.username}</h1>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="profile-stats">
                                <ul style={{ padding: '0' }}>
                                    <li>
                                        <span className="profile-stat-count">
                                            {data && data.length ? data.length : '0'}
                                        </span>
                                        &nbsp;posts
                                    </li>
                                    <li>
                                        <span className="profile-stat-count">188</span> followers
                                    </li>
                                    <li>
                                        <span className="profile-stat-count">206</span> following
                                    </li>
                                </ul>
                            </div>

                            <div className="profile-bio">
                                <p>
                                    <span className="profile-real-name">{userInfo.fullName}</span> {userInfo.bio || ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="container-post">
                        <hr />
                        <br />
                        <div className="profile-gallery">
                            {data.length ? data.map((post) => (
                                <div key={post._id}>
                                    <button onClick={() => handleOpenModal(post._id)}>
                                        <div className="gallery-container">
                                            <img src={post.photo} className="gallery-image" alt="" />
                                            <div className="gallery-stuff">
                                                <ul>
                                                    <li className="gallery-item-likes white-icon">
                                                        <span className="visually-hidden" >Likes:</span>
                                                        <FontAwesomeIcon icon={faHeart} className="me-2" />
                                                        {post.likes > 0 ? post.likes : 0}
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        <span className="visually-hidden">Comments:</span>
                                                        <FontAwesomeIcon icon={faComment} className="me-2n" />
                                                        &nbsp;{post.comments.length}
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            )) :
                                <div className="gallery-container nopost-title">
                                    <FontAwesomeIcon icon={faCamera} flip size="xl" />
                                    <div>
                                        Share Photos
                                    </div>
                                    <div className='nopost-sub-title'>
                                        when you share photos, they will appear on your profile.
                                    </div>
                                    <div >
                                        <a onClick={handleOpenModalManager}>
                                            <div className="nopost-sub-title">Share your first photo</div>
                                        </a>
                                    </div>
                                    <ModalManager isOpen={isModalManagerOpen} onClose={() => setModalManagerOpen(false)} />
                                </div>
                            }
                        </div>
                    </div>

                    <Modal ariaHideApp={false} isOpen={isOpen} onRequestClose={handleCloseModal} style={customStyles}>
                        {singlePost && (
                            <div style={{ display: 'inline-flex', fontSize: '15px' }}>
                                <div style={{ display: 'flex', width: '850px' }}>
                                    <img className="img-responsive pad" src={singlePost.photo} alt="Photo" style={{ width: '100%' }} />
                                </div>
                                &nbsp;
                                &nbsp;
                                <hr />
                                <div className="modal-comment-style box-body" >
                                    <div>
                                        <div style={{ display: 'inline-flex' }}>
                                            <img src={userInfo.profilePicture || 'https://freesvg.org/img/abstract-user-flat-4.png'}
                                                alt="Profile Image"
                                                style={{ width: '30px', height: '30px' }} />&nbsp;
                                            <a href={'/users/profile/' + userInfo._id} >{userInfo.username}</a>
                                        </div>
                                        <DropdownSelect
                                            options={menuOptions.map((option) => ({
                                                label: option.label,
                                                value: option.label,
                                            }))}
                                            values={[]} // You might need to set the initial value based on the selected post.
                                            closeOnSelect
                                            onChange={(values) => {
                                                console.log('Selected values:', values);
                                                // Find the selected option based on the selected value
                                                const selectedOption = menuOptions.find((option) => option.label === values[0]?.label);
                                                console.log('Selected option:', selectedOption);
                                                if (selectedOption && selectedOption.label === 'Delete Post') {
                                                    handleDeletePost(selectedPostId); // Pass the postId here

                                                    // Update the menuOptions state to close the dropdown after selecting 'Delete Post'
                                                    setMenuOptions((prevOptions) =>
                                                        prevOptions.map((option) =>
                                                            option.label === 'Delete Post'
                                                                ? { ...option, isMenuOpen: false } // Close the dropdown for 'Delete Post'
                                                                : option
                                                        )
                                                    );
                                                }
                                            }}
                                            isOpen={menuOptions.find((option) => option.isMenuOpen)}
                                            className="menu-dropdown"
                                        >
                                        </DropdownSelect>
                                        <hr />
                                        <div style={{ display: 'inline-flex', width: '100%' }}>
                                            {singlePost.caption}
                                        </div>
                                        <hr />
                                        {/* {singlePostDateTimeAgo} */}

                                        <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                                            {commentRows}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="instagram-post-actions">
                                            <hr />
                                            {/* <button type="button" onClick={() => handleAddLike(singlePost._id, userInfo._id)} className="btn btn-default btn-xs"> */}
                                            <button type="button" className="btn btn-default btn-xs">
                                                <FontAwesomeIcon icon={faHeart} />
                                            </button>
                                            &nbsp;
                                            <button type="button" className="btn btn-default btn-xs">
                                                <FontAwesomeIcon icon={faComment} />
                                            </button>
                                            &nbsp;
                                            <button type="button" className="btn btn-default btn-xs">
                                                <FontAwesomeIcon icon={faPaperPlane} />
                                            </button>
                                            &nbsp;
                                            <span className="pull-right text-muted">
                                                {singlePost.likes} likes - {singlePost.comments.length} comments
                                            </span>
                                            <hr />
                                            <form onSubmit={handleCommentSubmit}>
                                                <div className='form-group'>
                                                    <textarea
                                                        type="text"
                                                        name="body"
                                                        value={commentBody}
                                                        onChange={handleCommentBody}
                                                        className="input is-link form-control textarea"
                                                        placeholder='Add a comment...'
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                                <button type="submit" className="button btn btn-primary">
                                                    Post
                                                </button>
                                            </form>
                                            <br />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}
                        <button onClick={handleCloseModal}></button>
                    </Modal>
                </div>
            )}
        </main>
    );
};