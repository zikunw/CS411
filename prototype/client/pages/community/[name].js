import { useRouter } from 'next/router'

//TODO

const CommunityPage = () => {
  const router = useRouter()
  const { name } = router.query

  return <p>Community Name: {name}</p>
}

export default CommunityPage