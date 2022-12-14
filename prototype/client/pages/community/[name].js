import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../lib/firebase";
import {
  Avatar,
  IconButton,
  Image,
  Textarea,
  Button,
  CardHeader,
  CardBody,
  CardFooter,
  Select,
  Box,
  Flex,
  Card,
  Center,
  Heading,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Stack,
  Link,
  Grid,
  GridItem,
  Collapse,
} from "@chakra-ui/react";

import {
  isCommunityExist,
  getCommunityUsers,
  addCommunityPosts,
  getCommunityPosts,
  getUserInfo,
  getUser,
  getYoutubeById,
  deleteCommunityPost,
  getBookById,
  userInCommunity,
  addCommunityUser,
} from "../../lib/fetchCommunity";
// import { PostCard } from "../../components/PostCard";
import { useEffect, useState, setState, useContext } from "react";
import { UserContext } from "../../lib/context";
import LoginWarning from "../../components/LoginWarning";

import { AiFillDelete } from "react-icons/ai";

const CommunityPage = (props) => {
  const router = useRouter();
  const { name } = router.query;
  const { isValid, users, postList } = props;
  const [userIds, setUserIds] = useState([]);
  const [userInfos, setUserInfos] = useState([]);
  const [userIsInCommunity, setUserIsInCommunity] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { userData } = useContext(UserContext);
  const { user, username } = userData;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (user != null) {
      setLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    // const userIds = [];
    const userIdsTemp = [];
    async function getCommunityUsers1() {
      let res = await getCommunityUsers(name);
      // console.log(res);
      res.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        // setUserIds([...userIds, doc.id]);
        userIdsTemp.push(doc.id);
        //console.log("user id", doc.id);
        // console.log("userIds", [...userIds, doc.id]);
      });
      //console.log("this is userIdsTemp!!\n" + userIdsTemp);
      setUserIds(userIdsTemp);
      //console.log("this is userIds!!\n" + userIds);
    }

    getCommunityUsers1();
  }, [loaded]);

  useEffect(() => {
    const userInfosTemp = [];
    async function getCommunityUserInfo() {
      let maxLength = 10;
      if (userIds.length < 10) {
        maxLength = userIds.length;
      }

      for (let i = 0; i < maxLength; i++) {
        // we'll just display the top 10 users
        let res = await getUser(userIds[i]);
        // console.log("res " + JSON.stringify(res.data()));
        userInfosTemp.push({
          userDisplayName: res.data()["displayName"],
          userPic: res.data()["photoURL"],
          username: res.data()["username"],
          // console.log("test " + res.username);
        });
      }
      //console.log("userInfosTemp" + JSON.stringify(userInfosTemp));
      setUserInfos(userInfosTemp);
      // console.log("maxLength " + maxLength);
      // console.log("userIds after getInfo" + userIds);
    }

    getCommunityUserInfo();
  }, [userIds]);

  useEffect(() => {
    async function checkUserInCommunity() {
      console.log(user);
      if (user == null) {
        return;
      } else {
        let res = await userInCommunity(name, user.uid);
        setUserIsInCommunity(res);
      }
    }
    checkUserInCommunity();
  }, [user]);

  async function handleJoinButton(e) {
    e.preventDefault();
    const res = await addCommunityUser(name, user.uid, username);
    // console.log(res);
    setUserIsInCommunity(true);
    window.location.reload(false);
  }

  // if (userIds.includes(user.uid)) {
  //   setUserIsInCommunity(true);
  // }

  return (
    <Box>
      <Center>
        <Card bg="white" margin="2%" width="90%" padding="1%">
          <Center>
            <Heading size="3xl">{name}</Heading>
          </Center>
        </Card>
      </Center>

      <Center>
        <Grid
          templateAreas={`"posts users"`}
          gridTemplateRows={"1fr 1fr"}
          gridTemplateColumns={"minmax(200px, 1fr) 200px"}
          gap="1"
          width="90%"
        >
          {/* display the posts */}
          <GridItem area={"posts"}>
            <PostCardList postList={postList} communityName={name} />
          </GridItem>

          {/* Display community information */}
          <GridItem colStart={2} colEnd={5} area={"users"} marginRight="2%">
            <Card maxW="sm" bg="white">
              <CardHeader>
                <Heading size="sm">About Community</Heading>
                <Text fontSize="xs">Created November 29, 2022</Text>
              </CardHeader>

              <CardBody>
                <Heading size="sm">Users</Heading>
                {userInfos.map((obj) => {
                  return (
                    <User
                      key={obj.username}
                      userDisplayName={obj.userDisplayName}
                      username={obj.username}
                      userPic={obj.userPic}
                    />
                  );
                })}
              </CardBody>

              <CardFooter>
                {/* {loaded && userInfos.includes(user) ? ( */}
                {userIsInCommunity ? (
                  <Button onClick={onOpen}>Create Post</Button>
                ) : (
                  <>
                    <Text>You are not in this community</Text>
                    <Button onClick={handleJoinButton}>Join to Post</Button>
                  </>
                )}

                <Modal isOpen={isOpen} onClose={onClose}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Make a new post</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      {username && <PostForm communityName={name} />}
                      {!username && <LoginWarning />}
                    </ModalBody>

                    <ModalFooter>
                      <Button
                        colorScheme="gray"
                        mr={3}
                        onClick={onClose}
                        w="100%"
                      >
                        Cancel
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </CardFooter>
            </Card>
          </GridItem>
        </Grid>
      </Center>
    </Box>
  );
};

const PostForm = ({ communityName }) => {
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postURL, setPostURL] = useState("");
  const [postType, setPostType] = useState("youtube");

  const isError = postTitle === "" || postDescription === "" || postURL === "";

  const [previewResult, setPreviewResult] = useState("");
  const [hasPreview, setHasPreview] = useState(false);

  const { userData } = useContext(UserContext);
  const { user, username } = userData;

  // Sumbit post
  async function handlePostSubmission(e) {
    e.preventDefault();
    if (postType === "youtube") {
      const videoRegex = postURL.match("[?&]v=([^&]+)");
      // If the url is not valid
      if (videoRegex === null) {
        alert("invalid url");
        return;
      }
      if (isError) {
        console.log("please fill in every field.");
        return;
      }
      const videoId = videoRegex[1];
      const results = await getYoutubeById(videoId);

      await addCommunityPosts(
        communityName,
        postTitle,
        postType,
        postURL,
        postDescription,
        user.uid,
        username,
        user.displayName,
        user.photoURL,
        results.items[0].snippet.thumbnails.high.url,
        results.items[0].snippet.title,
        results.items[0].snippet.description
      );
    } else if (postType === "book") {
      const videoRegex = postURL.match("[?&]id=([^&]+)");
      // If the url is not valid
      if (videoRegex === null) {
        alert("invalid url");
        return;
      }
      if (isError) {
        console.log("please fill in every field.");
        return;
      }
      const videoId = videoRegex[1];
      const results = await getBookById(videoId);

      await addCommunityPosts(
        communityName,
        postTitle,
        postType,
        postURL,
        postDescription,
        user.uid,
        username,
        user.displayName,
        user.photoURL,
        results.volumeInfo.imageLinks.large,
        results.volumeInfo.title,
        results.volumeInfo.description
      );
    }

    window.location.reload(false);
  }

  // Handle post type change
  const handlePostTitleOnChange = (e) => setPostTitle(e.target.value);
  const handlePostDescriptionOnChange = (e) =>
    setPostDescription(e.target.value);
  const handlePostURLOnChange = (e) => setPostURL(e.target.value);
  const handlePostTypeOnChange = (e) => setPostType(e.target.value);

  // Handle preview post information
  const handlePreview = async (e) => {
    e.preventDefault();

    if (postType === "youtube") {
      const videoRegex = postURL.match("[?&]v=([^&]+)");
      // If the url is not valid
      if (videoRegex === null) {
        return;
      }
      const videoId = videoRegex[1];
      const results = await getYoutubeById(videoId);
      //console.log(results);
      if (results.items.length > 0) {
        setPreviewResult(
          <PostCard
            userDisplayName={username}
            username={user.displayName}
            userPic={user.photoURL}
            description={postDescription}
            thumbnail={results.items[0].snippet.thumbnails.high.url}
            urlTitle={results.items[0].snippet.title}
            urlContent={results.items[0].snippet.description}
          />
        );
      } else {
        setHasPreview(false);
      }
    } else if (postType === "book") {
      //Do book stuff
      const videoRegex = postURL.match("[?&]id=([^&]+)");
      // If the url is not valid
      if (videoRegex === null) {
        return;
      }
      const videoId = videoRegex[1];
      console.log(videoId);
      const results = await getBookById(videoId);
      console.log(results);
      if (!results.error) {
        setPreviewResult(
          <PostCard
            userDisplayName={username}
            username={user.displayName}
            userPic={user.photoURL}
            description={postDescription}
            thumbnail={results.volumeInfo.imageLinks.large}
            urlTitle={results.volumeInfo.title}
            urlContent={results.volumeInfo.description}
          />
        );
      } else {
        setHasPreview(false);
      }
    }
  };

  return (
    <Center>
      <FormControl>
        <Input
          marginTop="1%"
          type="text"
          placeholder="Title"
          maxLength="60"
          onChange={handlePostTitleOnChange}
        ></Input>
        <Textarea
          marginTop="1%"
          type="text"
          placeholder="Description"
          onChange={handlePostDescriptionOnChange}
        ></Textarea>
        <FormHelperText>
          Enter a Youtube or Book Link to share to this community!
        </FormHelperText>
        <Flex gap={1}>
          <Select
            marginTop="1%"
            w="150px"
            onChange={handlePostTypeOnChange}
            value={postType}
          >
            <option key="book" value="book">
              Book
            </option>
            <option key="youtube" value="youtube">
              Youtube
            </option>
          </Select>
          <Input
            flex="1"
            marginTop="1%"
            type="url"
            placeholder="Link"
            onChange={handlePostURLOnChange}
          ></Input>
          <Button marginTop="1%" onClick={handlePreview}>
            Preview
          </Button>
        </Flex>
        <Center>{previewResult}</Center>

        <Button
          marginTop="1%"
          colorScheme="blue"
          onClick={handlePostSubmission}
          w="100%"
        >
          Post
        </Button>
        {isError && <Badge colorScheme="gray">Invalid form.</Badge>}
      </FormControl>
    </Center>
  );
};

const PostCardList = ({ postList, communityName }) => {
  return (
    // <Stack spacing={8} direction="row">
    <Flex wrap="wrap">
      {postList.map((doc) => {
        const {
          content,
          displayName,
          title,
          type,
          url,
          user,
          userProfile,
          username,
          thumbnail,
          urlTitle,
          urlContent,
          postId,
        } = doc;
        return (
          <PostCard
            key={postId}
            communityName={communityName}
            postId={postId}
            userDisplayName={displayName}
            username={username}
            userPic={userProfile}
            description={content}
            thumbnail={thumbnail}
            title={title}
            urlTitle={urlTitle}
            urlContent={urlContent}
            uid={user}
          />
        );
      })}
    </Flex>

    // {/* </Stack> */}
  );
};

const PostCard = (props) => {
  const [show, setShow] = useState(false);
  const handleToggle = () => setShow(!show);

  const { userData } = useContext(UserContext);
  const { user, username } = userData;

  const handleDeletePost = async (e) => {
    e.preventDefault();
    await deleteCommunityPost(props.communityName, props.postId, user.uid);
    window.location.reload(false);
  };

  return (
    // <Card maxW="md" backgroundColor="white" margin="2%" width="200px">
    <Card backgroundColor="white" marginRight="2%" marginBottom="2%" w="md">
      <CardHeader pb={2}>
        <Flex spacing="4">
          <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
            <Avatar name={props.username} src={props.userPic} />
            <Box>
              <Heading size="sm">{props.userDisplayName}</Heading>{" "}
              <Text>{props.username}</Text>
            </Box>
          </Flex>
          {props.uid === user?.uid && (
            <IconButton
              variant="outline"
              colorScheme="gray"
              aria-label="See menu"
              icon={<AiFillDelete />}
              onClick={handleDeletePost}
            />
          )}
        </Flex>
      </CardHeader>

      <CardBody pt={2}>
        <Grid h="100%" templateColumns="repeat(4, 1fr)" gap={1}>
          <GridItem colSpan={4} onClick={handleToggle}>
            <Collapse startingHeight={50} in={show}>
              {props.description}
            </Collapse>
          </GridItem>
          <GridItem colSpan={4}>
            <Divider />
          </GridItem>
          <GridItem colSpan={1}>
            <Image
              objectFit="cover"
              src={props.thumbnail}
              alt="Chakra UI"
              maxW={{ base: "100%", sm: "150px" }}
              maxH="120px"
              borderRadius={13}
            />
          </GridItem>
          <GridItem colSpan={3} dir="row">
            <Heading size="sm">{props.urlTitle}</Heading>
            <Text color="gray" noOfLines={3}>
              {props.urlContent}
            </Text>
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  );
};

const User = (props) => {
  return (
    <Flex direction="row" marginTop="3%">
      <Avatar marginRight="5%" name={props.username} src={props.userPic} />
      <Center>
        <Text width="100%">{props.userDisplayName}</Text>
      </Center>
    </Flex>
  );
};

export async function getServerSideProps(context) {
  const { name } = context.query;

  const isValid = await isCommunityExist(name);
  const users = await getCommunityUsers(name);
  const postsInObject = await getCommunityPosts(name);
  const postList = [];

  postsInObject.forEach((rawdoc) => {
    const doc = rawdoc.data();

    postList.push({
      postId: rawdoc.id,
      content: doc.content,
      displayName: doc.displayName,
      title: doc.title,
      type: doc.type,
      url: doc.url,
      user: doc.user,
      userProfile: doc.userProfile,
      username: doc.username,
      thumbnail: doc.thumbnail,
      urlTitle: doc.urlTitle,
      urlContent: doc.urlContent,
    });
  });

  return {
    props: {
      isValid: isValid,
      users: JSON.stringify(users),
      postList: postList,
    }, // will be passed to the page component as props
  };
}

export default CommunityPage;
