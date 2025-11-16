import { render, screen } from '@testing-library/react'
import MovieList from '@/components/MovieList'
import { useMovies, useMoviesStore } from '@/hooks/movies'
import mockMovies from '@/__mocks__/movies.json'

// hooks 모킹
jest.mock('@/hooks/movies', () => ({
  useMovies: jest.fn(),
  useMoviesStore: jest.fn()
}))
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))
jest.mock('next/link', () => {
  return function Link({ children, href, prefetch, ...props }: any) {
    // prefetch는 Next.js 전용 prop이므로 HTML <a> 태그에 전달하지 않음
    return (
      <a
        href={href}
        {...props}>
        {children}
      </a>
    )
  }
})
jest.mock('next/image', () => {
  return function Image({ src, alt }: any) {
    return (
      <img
        src={src}
        alt={alt}
      />
    )
  }
})

describe('<MovieList>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('영화 목록이 정상적으로 렌더링된다', () => {
    ;(useMoviesStore as unknown as jest.Mock).mockReturnValue('')
    ;(useMovies as jest.Mock).mockReturnValue({
      data: mockMovies.Search
    })

    render(<MovieList />)

    // 첫 번째 영화 제목이 표시되는지 확인 (여러 개 있을 수 있으므로 getAllByText 사용)
    const titles = screen.getAllByText(mockMovies.Search[0].Title)
    expect(titles.length).toBeGreaterThan(0)
    expect(titles[0]).toBeInTheDocument()
  })

  test('영화 목록이 비어있고 메시지가 있을 때 메시지가 표시된다', () => {
    const testMessage = 'Search for the movie title!'
    ;(useMoviesStore as unknown as jest.Mock).mockReturnValue(testMessage)
    ;(useMovies as jest.Mock).mockReturnValue({
      data: []
    })

    render(<MovieList />)

    expect(screen.getByText(testMessage)).toBeInTheDocument()
  })

  test('영화 목록이 있을 때는 메시지가 표시되지 않는다', () => {
    const testMessage = 'Search for the movie title!'
    ;(useMoviesStore as unknown as jest.Mock).mockReturnValue(testMessage)
    ;(useMovies as jest.Mock).mockReturnValue({
      data: mockMovies.Search
    })

    render(<MovieList />)

    expect(screen.queryByText(testMessage)).not.toBeInTheDocument()
  })

  test('영화 목록이 undefined일 때 메시지가 표시된다', () => {
    const testMessage = 'Search for the movie title!'
    ;(useMoviesStore as unknown as jest.Mock).mockReturnValue(testMessage)
    ;(useMovies as jest.Mock).mockReturnValue({
      data: undefined
    })

    render(<MovieList />)

    expect(screen.getByText(testMessage)).toBeInTheDocument()
  })
})
