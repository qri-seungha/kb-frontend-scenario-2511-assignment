import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MovieItem from '@/components/MovieItem'
import mockMovie from '@/__mocks__/movie.json'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
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
/* eslint-disable @next/next/no-img-element */
jest.mock('next/image', () => {
  return function Image({ src, alt, width, height }: any) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
      />
    )
  }
})

describe('<MovieItem>', () => {
  const simpleMovie = {
    Title: mockMovie.Title,
    Year: mockMovie.Year,
    imdbID: mockMovie.imdbID,
    Type: mockMovie.Type,
    Poster: mockMovie.Poster
  }

  beforeEach(() => {
    mockPush.mockClear()
  })

  test('영화 아이템이 정상적으로 렌더링된다', () => {
    render(<MovieItem movie={simpleMovie} />)
    expect(screen.getByText(simpleMovie.Title)).toBeInTheDocument()
  })

  test('영화 제목과 연도가 올바르게 표시된다', () => {
    render(<MovieItem movie={simpleMovie} />)
    expect(screen.getByText(simpleMovie.Title)).toBeInTheDocument()
    expect(screen.getByText(simpleMovie.Year)).toBeInTheDocument()
  })

  test('영화 포스터 이미지가 올바른 속성으로 렌더링된다', () => {
    render(<MovieItem movie={simpleMovie} />)
    const image = screen.getByAltText(simpleMovie.Title)
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', simpleMovie.Poster)
    expect(image).toHaveAttribute('width', '200')
    expect(image).toHaveAttribute('height', '300')
  })

  test('영화 상세 페이지로 이동하는 링크가 올바른 href를 가진다', () => {
    render(<MovieItem movie={simpleMovie} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/movies/${simpleMovie.imdbID}`)
  })

  test('포스터 보기 버튼을 클릭하면 포스터 페이지로 이동한다', async () => {
    const user = userEvent.setup()
    render(<MovieItem movie={simpleMovie} />)
    const button = screen.getByRole('button')
    await user.click(button)
    expect(mockPush).toHaveBeenCalledWith(`/poster/${simpleMovie.imdbID}`)
  })
})
