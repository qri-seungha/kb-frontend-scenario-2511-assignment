import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMovies, useMoviesStore, getInitialState } from '@/hooks/movies'
import mockMovies from '@/__mocks__/movies.json'
import axios from 'axios'

// axios 모킹
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// QueryClient Provider 래퍼
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false // 기본적으로 지수 백오프로 3회를 재시도하므로, 테스트를 위해 비활성화
      }
    }
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('useMoviesStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    useMoviesStore.setState(getInitialState())
  })

  test('setInputText가 inputText를 업데이트한다', () => {
    const { result } = renderHook(() => useMoviesStore())

    act(() => {
      result.current.setInputText('frozen')
    })

    expect(result.current.inputText).toBe('frozen')
  })

  test('setSearchText가 searchText를 업데이트한다', () => {
    const { result } = renderHook(() => useMoviesStore())

    act(() => {
      result.current.setSearchText('frozen')
    })

    expect(result.current.searchText).toBe('frozen')
  })

  test('setMessage가 message를 업데이트한다', () => {
    const { result } = renderHook(() => useMoviesStore())

    act(() => {
      result.current.setMessage('Test message')
    })

    expect(result.current.message).toBe('Test message')
  })

  test('resetMovies가 모든 상태를 초기화한다', () => {
    const { result } = renderHook(() => useMoviesStore())

    // 먼저 상태 변경
    act(() => {
      result.current.setInputText('frozen')
      result.current.setSearchText('frozen')
      result.current.setMessage('Test message')
    })

    // reset 실행
    act(() => {
      result.current.resetMovies()
    })

    // 초기 상태로 돌아왔는지 확인
    const initialState = getInitialState()
    expect(result.current.inputText).toBe(initialState.inputText)
    expect(result.current.searchText).toBe(initialState.searchText)
    expect(result.current.message).toBe(initialState.message)
  })
})

describe('useMovies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useMoviesStore.setState(getInitialState())
  })

  test('searchText가 비어있을 때 빈 배열을 반환한다', async () => {
    const { result } = renderHook(() => useMovies(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.data).toEqual([])
    })
  })

  test('searchText가 있을 때 API를 호출하고 영화 목록을 반환한다', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockMovies })

    // searchText를 설정
    act(() => {
      useMoviesStore.setState({ searchText: 'frozen' })
    })

    const { result } = renderHook(() => useMovies(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.data).toEqual(mockMovies.Search)
    })

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/movies?title=frozen')
  })

  test('API가 False Response를 반환할 때 에러를 던진다', async () => {
    const errorMessage = 'Movie not found!'
    // retry: 1이므로 총 2번 호출됨 (초기 + 재시도 1회)
    mockedAxios.get.mockResolvedValue({
      data: { Response: 'False', Error: errorMessage }
    })

    // searchText를 설정
    act(() => {
      useMoviesStore.setState({ searchText: 'notfound' })
    })

    const { result } = renderHook(() => useMovies(), {
      wrapper: createWrapper()
    })

    // 에러가 발생할 때까지 대기
    await waitFor(
      () => {
        expect(result.current.isError).toBe(true)
      },
      { timeout: 3000 }
    )

    // 에러 메시지가 스토어에 설정되었는지 확인
    expect(useMoviesStore.getState().message).toBe(errorMessage)
  })

  test('공백만 있는 searchText는 빈 배열을 반환한다', async () => {
    // searchText를 공백으로 설정
    act(() => {
      useMoviesStore.setState({ searchText: '   ' })
    })

    const { result } = renderHook(() => useMovies(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.data).toEqual([])
    })

    // API가 호출되지 않았는지 확인
    expect(mockedAxios.get).not.toHaveBeenCalled()
  })

  test('isFetching이 로딩 상태를 올바르게 반영한다', async () => {
    // API 호출을 지연시켜 로딩 상태를 확인할 수 있도록 함
    mockedAxios.get.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => resolve({ data: mockMovies }), 100)
        })
    )

    // searchText를 설정
    act(() => {
      useMoviesStore.setState({ searchText: 'frozen' })
    })

    const { result } = renderHook(() => useMovies(), {
      wrapper: createWrapper()
    })

    // 초기에는 로딩 중이어야 함
    expect(result.current.isFetching).toBe(true)

    // 데이터 로드 완료 대기
    await waitFor(() => {
      expect(result.current.isFetching).toBe(false)
    })

    expect(result.current.data).toEqual(mockMovies.Search)
  })
})
