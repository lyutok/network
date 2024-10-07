document.addEventListener('DOMContentLoaded', function() {
    console.log("Default script execution");
    loadContent(event); // by default
    // new DataTable('#example');

    // Get all elements - links
    const links = document.querySelectorAll('.switch-view');
    let isLogged = links.length > 2;

    // get logged username
    let logged_username  = '';
    if (document.querySelector('#current-user')) {
        logged_username = document.querySelector('#current-user').textContent;
    }

    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const title = this.innerText;
            console.log('Button pressed:', title);

            if (document.querySelector('h1')) {
                document.querySelector('h1').innerHTML = 'All Posts';
            }

            switch(title) {
                case "Network":
                    window.location.href = '/';
                    event.preventDefault();
                    loadContent(event);
                    console.log("Show Post form.")
                    showSection();
                    hideFollowUser();
                    break;
                case "All Posts":
                    if (!isLogged) {
                        window.location.href = '/';
                    }

                    loadContent(event);
                    console.log("Hide Post form.")
                    hideSection();
                    hideFollowUser();
                    break;
                case "Following":
                    document.querySelector('h1').innerHTML = 'Following';
                    loadContentFollowing(event, logged_username);
                    console.log("Hide Post form.")
                    hideSection();
                    hideFollowUser();
                    break;
                case "Log Out":
                    // window.location.href = 'logout';
                    console.log("Hide Post form.")
                    hideSection();
                    hideFollowUser();
                    break;
                case "Log In":
                    // window.location.href = 'login';
                    console.log("Hide Post form.")
                    hideSection();
                    hideFollowUser();
                    break;
                default:
                    // window.location.href = `/user/${title}`;
                    console.log("Profile of: ", title);
                    console.log("Hide Post form.")
                    hideSection();
                    // page title=username
                    document.querySelector('h1').innerHTML = title;
                    followUser(title, isLogged, title);
                    loadContent(event, title);
            }
            // Add the current state to the history
            // const url = this.getAttribute('href');
            // history.pushState({ section: title }, "", url);
        });
    });
});


function hideFollowUser() {
    const container = document.querySelector('#followers-grid');
    if (container) {
        container.innerHTML = '';
    }
}


async function followUser(username, islogged, current_user) {
    // get data of user
    try {
        let user = await loadUserData(username, current_user);
        console.log("UserData of: ", user);
        console.log("Current logged user: ", current_user);
        // Check if user data is successfully loaded
        if (!user) {
            console.error("Failed to load user data for username:", username);
            return;
        }

    console.log("UserData username: ", user.username);

    const container = document.querySelector('#followers-grid');

    if (container) {
        container.innerHTML = '';

    const followers = document.createElement('label');
    followers.classList.add('space');
    followers.innerHTML = `Followers: ${user.followers}`;
    const following = document.createElement('label');
    following.innerHTML = `Following: ${user.following}`;

    container.appendChild(followers);
    container.appendChild(following);

    var follow_button_title = "";

    // Name of the button - check if the user is follower
    console.log("Is Follower? ", await isFollower(username, current_user));
    if (await isFollower(username, current_user)) {
        follow_button_title = "Unfollow";
    } else {
        follow_button_title = "Follow";
    }

    // User is logged in and username !== current_user show Follow/Unfollow button
    if (islogged && username !== current_user) {
        const follow_button = document.createElement('button');
        follow_button.classList.add('btn', 'btn-info', 'space');
        console.log("Button title: ", follow_button_title);
        follow_button.innerHTML = follow_button_title;

        follow_button.addEventListener('click', () => { handleFollowButtonClick(username, current_user);
                                                        updateFollowerData(user, followers)
        });

        container.appendChild(follow_button);
    }

    }
} catch (error) {
    console.error('Error loading user data:', error);
    }
}

// User data for followers
function updateFollowerData(user, followers) {
    var button = document.querySelector('.btn-info');
    var btn_name = button.innerHTML;

    let str = followers.innerHTML;
    let parts = str.split(" ");
    let number = parseInt(parts[1]);

    if (btn_name === "Unfollow") {
        number += 1;
        // console.log("Updated Followers data", followers.innerHTML);
    } else {
        number -= 1;
    }
    console.log("Updated Followers data", number);
    followers.innerHTML = `Followers: ${number}`;
}


async function isFollower(username, current_user) {
    const response = await fetch(`/followers`);
    const followers = await response.json();
    // Filter followers by active = true
    const activeFollowers = followers.filter(follower => follower.active === true
        && follower.user__username === current_user
        && follower.follows_user__username === username);
    console.log("activeFollowers.length", activeFollowers.length);
    return activeFollowers.length > 0;
}


async function handleFollowButtonClick(username, current_user) {
    console.log("Button Follow/Unfollow clicked", username, current_user);

    var button = document.querySelector('.btn-info');
    var btn_name = button.innerHTML;

    if (btn_name === "Unfollow") {
        // change button name
        button.innerHTML = "Follow";

        console.log("PUT Username, current_user: ", username, current_user);
            // Mark Inactive appropriate row in Follow
            fetch(`/followers?user=${encodeURIComponent(username)}&current_user=${encodeURIComponent(current_user)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: current_user,
                follows_user: username,
                active: false
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.json();
        })
        .then(data => {
            console.log('Successfully updated follower status:', data);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });

    } else {

        button.innerHTML = "Unfollow";

        const response = await fetch(`/followers?user=${encodeURIComponent(username)}&current_user=${encodeURIComponent(current_user)}`);
        console.log("Print result of response fetch followers", response.status);

        const followers = await response.json();
        if (followers.length > 0) {
            isFollower_value = true;
        } else {
            isFollower_value = false;
        }
        console.log("isFollower_value", isFollower_value);

        if (isFollower_value) {
            // if there is (true), then update
            await fetch(`/followers?user=${encodeURIComponent(username)}&current_user=${encodeURIComponent(current_user)}`, {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: current_user,
                    follows_user: username,
                    active: true
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text); });
                }
                return response.json();
            })
            .then(data => {
                console.log('Successfully updated follower status:', data);
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
        }

        else {

        // add the row in db Followers
        await fetch(`/followers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // For Django CSRF protection
            },
            body: JSON.stringify({
                user: current_user,
                follows_user: username,
                active: true
            })
          })
          .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
          .then(result => {
              // Print result
              console.log("Result", result);
          })
          .catch(error => {
            console.error('Error:', error);
        });
        }
    }
}


// Function to get CSRF token from cookies (needed for Django)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


async function loadUserData(username = null, current_user) {
    // set up followers block
    var followers_number = 0;
    var following_number = 0;

    let url = '/followers';

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log("Followers data: ", data);

        // Calculate following number
        following_number = data.filter(item => item.active === true && item.user__username === username).length;
        console.log("following_number", following_number);

        // Calculate followers number
        followers_number = data.filter(item => item.follows_user__username === username && item.active === true).length;
        console.log("followers_number", followers_number);

    } catch (error) {
        console.error('Error:', error);
    }

    let userData = {
        username: username,
        following: following_number.toString(),
        followers: followers_number.toString()
    };

    console.log("USERDATA", userData);
    return userData;
}

// Show post section
function showSection() {
    const section = document.querySelector('#create-post-form');

    if (section) {
        section.style.display = 'block';
        console.log("Section shown");
    }
}

// Hide post section
function hideSection() {
    event.preventDefault();
    const section = document.querySelector('#create-post-form');

    if (section) {
        section.style.display = 'none';
        console.log("Section is hidden");
    }
}


// Following posts
async function loadContentFollowing(event, logged_username) {
    event.preventDefault();
    console.log("Execute loadContentFollowing.");

    // Get followers usernames
    // let url = '/followers';
    const response = await fetch(`/followers`);
    const followings = await response.json();
    // Filter followers by active = true and
    const active_followings = followings.filter(following => following.active === true
        && following.user__username === logged_username);

    let usernames = active_followings.map(following => following.follows_user__username);

    console.log("activeFollowings for logged_username", usernames, logged_username);

    const resporse_posts = await fetch(`/posts`);
    const posts = await resporse_posts.json();

    const following_posts = posts.filter(post => usernames.includes(post.user__username));
    console.log(following_posts);

    // addPosts(following_posts);
    paginator(following_posts);
}


function loadContent(event=null, title=null, name=null) {
    console.log("Execute loadContent.");
    // Check if event is an object and has the preventDefault method
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }

    console.log("Title filter", title);

    console.log("loadContent works");
    let url = '/posts';
    console.log("Filter", title);
    if (title) {
        url += `?username=${encodeURIComponent(title)}`;
        // /posts?username=admin1
    }
    return fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(posts => {
        // Print the posts to the console
        console.log("adding posts");
        console.log("Fetched data: ", posts);
        paginator(posts);
    });
}


function paginator(posts) {
    console.log("For paginator received: ", posts);
    let page = document.querySelector('#page');
    let next = document.querySelector('a.page-link[aria-label="Next"]');
    let prev = document.querySelector('a.page-link[aria-label="Previous"]');

    prev.style.pointerEvents = 'none';
    prev.style.color = 'gray';

    posts_qty = posts.length;
    limit = 10; // posts per page
    offset = 0; // how many posts to skip
    page_number = 1;
    page.textContent = page_number;
    pages_qty = Math.ceil(posts_qty / limit);
    console.log("pages_qty: ", pages_qty);
    console.log("start page_number: ", page_number);

    prev.style.pointerEvents = 'none';

    if (page_number !== pages_qty && pages_qty !== 0) {
        next.style.pointerEvents = 'auto';
        next.style.color = '';
    } else {
        next.style.pointerEvents = 'none';
        next.style.color = 'gray';
    }

    post_portion = posts.slice(offset, offset+limit);
    console.log("Add posts 1 page", post_portion.length);
    addPosts(post_portion);



    // Remove existing event listeners to avoid duplication
    next.replaceWith(next.cloneNode(true));
    prev.replaceWith(prev.cloneNode(true));

    // Re-select the buttons after cloning
    next = document.querySelector('a.page-link[aria-label="Next"]');
    prev = document.querySelector('a.page-link[aria-label="Previous"]');






    next.addEventListener('click', () => {
        window.scrollTo(0, 0);

        if (pages_qty > page_number) {
            page_number += 1;
            console.log("pages_qty: ", pages_qty);
            console.log("page_number: ", page_number);

            page.textContent = page_number;
            prev.style.pointerEvents = 'auto';
            prev.style.color = '';

            offset += limit;
            console.log("offset next", offset);
            post_portion = posts.slice(offset, offset+limit);
            console.log("Add posts Next page", post_portion.length);
            console.log(post_portion);

            // if (offset+limit >= posts_qty) {
            //     next.style.pointerEvents = 'none';
            //     next.style.color = 'gray';
            // }

            if (page_number === pages_qty) {
                next.style.pointerEvents = 'none';
                next.style.color = 'gray';
            }

            addPosts(post_portion);

        }
        // else {
        //     next.style.pointerEvents = 'none';
        //     next.style.color = 'gray';
        // }
    });

    prev.addEventListener('click', () => {
        window.scrollTo(0, 0);
        console.log("page_number Prev", page_number);

        if (page_number > 1) {
            page_number -= 1;
            console.log("pages_qty: ", pages_qty);
            console.log("page_number: ", page_number);

            page.textContent = page_number;
            next.style.pointerEvents = 'auto';
            next.style.color = '';

            offset -=limit;
            console.log("Offset Prev", offset);
            post_portion = posts.slice(offset, offset+limit);

            if (offset === 0) {
                prev.style.pointerEvents = 'none';
                prev.style.color = 'gray';
            }

            addPosts(post_portion);
        } else {
            prev.style.pointerEvents = 'none';
            prev.style.color = 'gray';
        }
    });
}


function addPosts(posts) {

    const posts_container = document.querySelector('#posts');

    // getting current logged in user
    let anchor_for_logged_user = document.querySelector('#current-user');
    let current_logged_user = "";

    if (anchor_for_logged_user !== null) {
        current_logged_user = anchor_for_logged_user.textContent;
        // console.log("post, current_logged_user", current_logged_user);
    }

    if (posts_container !== null) {
        if (posts_container.innerHTML !== '') {
            posts_container.innerHTML = '';
        }
        // post_portion.forEach
        posts.forEach(postData => {

        // const tr = document.createElement('tr');
        // posts_container.appendChild(tr);

        // const td = document.createElement('td');
        // tr.appendChild(td);

        // Create the form element
        const form = document.createElement('form');
        form.className = 'rectangle-frame form-group rectangle-color';

        // td.appendChild(form);

        // Append the form to container
        posts_container.appendChild(form);

        // Log the form to the console for verification
        console.log("form");

        const username = document.createElement('div');
        const user_button = document.createElement('button');
        user_button.className = 'btn btn-link';
        user_button.textContent = postData.user__username;

        // hide/show "user button" for logged/not logged user
        if (!current_logged_user) {
            user_button.hidden = true;
        } else {
            user_button.hidden = false;
        }
        // click user button
        user_button.onclick = function(event) {
            window.scrollTo(0, 0);
            event.preventDefault();
            document.querySelector('h1').innerHTML = postData.user__username;
            hideSection();
            // console.log("postData.user__username, current_logged_user:", postData.user__username, current_logged_user);
            followUser(postData.user__username, true, current_logged_user);
            loadContent(event, postData.user__username)
        };
        username.appendChild(user_button);
        form.appendChild(username);

        const post = document.createElement('div');
        const post_text = document.createElement('textarea');
        post_text.className = 'form-control';
        // post_text.style.height = "100px";
        post_text.rows = 5;
        post_text.textContent = postData.post;
        post_text.id = "m" + `${postData.id}`;

        post_text.disabled = true;
        // Append post_text to post and div to form
        post.appendChild(post_text);
        form.appendChild(post);

        // Create Edit button
        const edit_save = document.createElement('div');

        const edit_button = document.createElement('button');
        edit_button.className = 'btn btn-link';
        edit_button.textContent = 'Edit';

        // Create Save button and hide untill Edit pressed
        const save_button = document.createElement('button');
        save_button.className = 'btn btn-link';
        save_button.textContent = 'Save';
        save_button.style.display = "none";

        // what to do on click Save/Edit
        edit_button.addEventListener('click', function(event) {
            editPost(event, post_text, edit_button, save_button);
        });
        save_button.addEventListener('click', function(event) {
            savePost(event, post_text, edit_button, save_button);
        });

        // hide/show "edit" condition
        if (postData.user__username !== current_logged_user) {
            edit_button.hidden = true;
        } else {
            edit_button.hidden = false;
        }

        // Append the save_button, edit_button to the div, div to form
        edit_save.appendChild(save_button);
        edit_save.appendChild(edit_button);
        form.appendChild(edit_save);

        const created = document.createElement('div');
        created.className = 'grey-text';
        // Format date
        const isoDateString = postData.created;
        const formattedDate = moment(isoDateString).format('MMM DD, YYYY HH:mm:ss [GMT]');
        created.innerHTML = formattedDate;
        form.appendChild(created);

        // Create Like button
        const like_dislike = document.createElement('div');

        const like_button = document.createElement('button');
        like_button.style.border = 'none';
        like_button.style.backgroundColor = 'transparent';

        // hide/show "like button" for logged/not logged user and decide which Like/Dislike button to show according to db records
        if (!current_logged_user) {
            like_button.disabled = true;
            like_button.textContent = '❤️';
        } else {
            like_button.disabled = false;
            // check if there is record in db for current user
            isLikes(current_logged_user, postData.id).then(isLiked => {
            if (isLiked) {
                console.log('grey', isLiked);
                like_button.textContent = '🤍';
            } else {
                like_button.textContent = '❤️';
            }
        });
        }

        // label to show likes number
        const likes = document.createElement('label');
        likes.className = 'grey-text';
        likes.innerHTML = `${postData.likes}`;

        // Append the like_button, dislike_button to the div, div to form
        like_dislike.appendChild(like_button);
        like_dislike.appendChild(likes);

        form.appendChild(like_dislike);

        // what to do on click Like/Dislike
        like_button.addEventListener('click', function(event) {
            likePost(event, post_text, likes, like_button);
            updateisLikes(current_logged_user, postData.id);
        });
    });
}
}

// check if current logged user already likes of the posts
async function isLikes(current_logged_user, post_id) {
    console.log("Execute isLikes for username, post_id: ", current_logged_user, post_id);

    // likes?user=admin1&post_id=7
    const response = await fetch(`/likes?user=${encodeURIComponent(current_logged_user)}&post_id=${encodeURIComponent(post_id)}`);
    const likes = await response.json();
    const active_records = likes.filter(like_record => like_record.like === true);
    console.log("likes for post id, likes, active: ", post_id, likes, active_records);

    return active_records.length > 0;
}

// updates like records in db
async function updateisLikes(logged_user, post_id) {
    console.log("updateisLikes logged_user, post_id", logged_user, post_id);

    const response = await fetch(`/likes?user=${encodeURIComponent(logged_user)}&post_id=${encodeURIComponent(post_id)}`);
    const likes = await response.json();
    const active_records = likes.filter(like_record => like_record.like === true);
    const inactive_records = likes.filter(like_record => like_record.like === false);

    if (likes.length === 0) {
        // if there are no rows at all, add the row in db in Likes (POST)
        await fetch(`/likes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // For Django CSRF protection
            },
            body: JSON.stringify({
                user: logged_user,
                post_id: post_id,
                like: true
            })
          })

    } else if (inactive_records.length > 0) {
        // if no active, update to active (PUT)
        await fetch(`/likes?user=${encodeURIComponent(logged_user)}&post_id=${encodeURIComponent(post_id)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                like: true
            })
        })
    } else if (active_records.length > 0) {
        // // if active, update to inactive (PUT)
        await fetch(`/likes?user=${encodeURIComponent(logged_user)}&post_id=${encodeURIComponent(post_id)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                like: false
            })
        })
    }
}

// Like post pressed - UI
function likePost(event, post_text, likes, like_button) {
    event.preventDefault();
    console.log("Like/dislike Post clicked");
    likes_number = parseInt(likes.innerHTML);

    if (like_button.textContent === '❤️') {
        like_button.textContent = '🤍';

        likes_number += 1;
        likes.innerHTML = likes_number;
    }
    else {
        like_button.textContent = '❤️';
        likes_number -= 1;
        likes.innerHTML = likes_number;
    }

    // get id number
    let str = post_text.id;
    let id = str.substring(1);

    saveUpdates(id, null, likes_number);
}

// Edit Post
function editPost(event, post_text, edit_button, save_button) {
    event.preventDefault();
    console.log("Edit Post clicked");
    post_text.disabled = false;
    edit_button.style.display = "none";
    save_button.style.display = "block";
}

// Save the post after edit
function savePost(event, post_text, edit_button, save_button) {
    event.preventDefault();

    // get updated text from UI
    const text_area = document.querySelector(`#${post_text.id}`);
    let updated_text = text_area.value;

    console.log("Save Post clicked", updated_text);
    post_text.disabled = true;
    edit_button.style.display = "block";
    save_button.style.display = "none";

    // get id number
    let str = post_text.id;
    let id = str.substring(1);

    saveUpdates(id, updated_text, null);
}


// Save updated post
async function saveUpdates(id, updated_text=null, likes_number=null){
    console.log("post id, updated text or likes", id, updated_text, likes_number);
    console.log("PUT Update post");
    // let bodyObject = updated_text ? {post: updated_text} : {likes: likes_number};
        // /posts?id=26
        await fetch(`/posts?id=${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // For Django CSRF protection
        },
        // body: JSON.stringify(bodyObject)
        body: JSON.stringify({
            id: id,
            post: updated_text,
            likes: likes_number,
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
    })
    .then(data => {
        console.log('Successfully updated post text or likes:', data);
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}



// window.onpopstate = function(event) {
//     if (event.state) {
//         const title = event.state.section;
//         document.querySelector('h1').innerText = title;

//         if (title === "Network") {
//             showSection();
//         } else {
//             hideSection();
//         }

//         if (!["Network", "Following", "All Posts"].includes(title)) {
//             followUser(title, isLogged, title);
//             loadContent(title);
//         } else {
//             hideFollowUser();
//             loadContent();
//         }
//     }
// };

