import { GET } from '@/app/api/movies/route'
import axios from 'axios'
import mockMovies from '@/__mocks__/movies.json'

// axios 모킹
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('GET /api/movies', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv, OMDB_API_KEY: 'test-api-key' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  test('title 파라미터로 OMDB API를 호출하고 응답을 반환한다', async () => {
    const title = 'frozen'
    mockedAxios.get.mockResolvedValueOnce({ data: mockMovies })

    const request = new Request(
      `http://localhost:3000/api/movies?title=${title}`
    )
    const response = await GET(request)
    const data = await response.json()

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `https://omdbapi.com/?apikey=test-api-key&s=${title}`
    )
    expect(data).toEqual(mockMovies)
  })

  test('API_KEY가 환경변수에서 올바르게 사용된다', async () => {
    const title = 'frozen'
    const customApiKey = 'custom-test-key'
    process.env.OMDB_API_KEY = customApiKey
    mockedAxios.get.mockResolvedValueOnce({ data: mockMovies })

    const request = new Request(
      `http://localhost:3000/api/movies?title=${title}`
    )
    await GET(request)

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `https://omdbapi.com/?apikey=${customApiKey}&s=${title}`
    )
  })
})
