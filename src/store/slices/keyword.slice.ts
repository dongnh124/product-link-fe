import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '..';
import request, { ERequestStatus, RequestError } from '~common/request';

export interface IKeyword {
  id: string;
  keyword: string;
  links: string[];
}

export interface IKeywordState {
  keywords: IKeyword[];
  status: ERequestStatus;
}

const initialState: IKeywordState = {
  keywords: [],
  status: ERequestStatus.IDLE,
};

export const fetchKeywords = createAsyncThunk('keyword/fetchkeywords', async () => {
  const response = await request.get<IKeyword[]>('crawl');
  return response.result;
});

export const crawl = createAsyncThunk('keyword/crawl', async (keyword: string) => {
  const response = await request.post<string, IKeyword>(`crawl`, JSON.stringify({ keyword }));
  if (!response.success)
    throw new RequestError(
      // eslint-disable-next-line no-nested-ternary
      !response.message
        ? 'Internal server error'
        : Array.isArray(response?.message)
          ? response?.message.join('')
          : response?.message,
    );
  return response.result;
});

export const keywordSlice = createSlice({
  name: 'keyword',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKeywords.pending, (_state) => {
        const state = _state;
        state.status = ERequestStatus.LOADING;
      })
      .addCase(fetchKeywords.fulfilled, (_state, action) => {
        const state = _state;
        state.status = ERequestStatus.SUCCEEDED;
        state.keywords = action.payload || [];
      })
      .addCase(fetchKeywords.rejected, (_state) => {
        const state = _state;
        state.status = ERequestStatus.FAILED;
      })
      .addCase(crawl.pending, (_state) => {
        const state = _state;
        state.status = ERequestStatus.LOADING;
      })
      .addCase(crawl.fulfilled, (_state, action) => {
        const state = _state;
        state.status = ERequestStatus.SUCCEEDED;
        if (action.payload) {
          state.keywords = [...state.keywords, action.payload];
        }
      })
      .addCase(crawl.rejected, (_state) => {
        const state = _state;
        state.status = ERequestStatus.FAILED;
      });
  },
});

export const selectKeyword = (state: RootState) => state.keyword.keywords;
export const selectStatus = (state: RootState) => state.keyword.status;

export default keywordSlice.reducer;
