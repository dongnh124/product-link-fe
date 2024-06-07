/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Progress, Card, Row, Col } from 'antd';
import { useDropzone } from 'react-dropzone';
import readXlsxFile from 'read-excel-file';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '~store/hooks';
import {
  crawl,
  fetchKeywords,
  selectStatus,
  selectKeyword,
  IKeyword,
} from '~store/slices/keyword.slice';
import { ERequestStatus } from '~common/request';

import './style.css';
import generateRandomString from '~common/randomg-string.helper';

const readExcel = (file) =>
  new Promise((resolve, reject) => {
    readXlsxFile(file)
      .then((rows) => resolve(rows.flat()))
      .catch((e) => {
        reject(e);
      });
  });
const CustomProgress = styled(Progress)`
  width: 400px;
  .ant-progress-text {
    color: #333;
  }
`;
const Home = () => {
  const keywordList = useAppSelector(selectKeyword);
  const keywordStatus = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();
  const [files, setFiles] = useState<Array<any>>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState(ERequestStatus.IDLE);
  const [count, setCount] = useState(0);

  const handleDropZoneDrop = useCallback((acceptedFiles) => {
    setFiles([acceptedFiles[0]]);
    setFileName(acceptedFiles[0].name);
    setError('');
    setUploadStatus(ERequestStatus.SUCCEEDED);
    readExcel(acceptedFiles[0])
      .then((res) => {
        console.log('\nres-363066:\n', res);
        setKeywords(res as string[]);
      })
      .catch((e) => {
        console.log('excel: ', e);
      });

    return acceptedFiles[0];
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );
    },
    onDropAccepted: (acceptedFiles) => handleDropZoneDrop(acceptedFiles),
  });
  const uploadFileToServer = async () => {
    if (uploadStatus === ERequestStatus.LOADING) {
      return;
    }
    setUploadStatus(ERequestStatus.LOADING);
    try {
      for (const keyword of keywords) {
        try {
          await dispatch(crawl(keyword));
        } catch (err) {
          console.log('\nerror-922396:\n', err);
        }
        setCount((prevCount) => prevCount + 1);
      }
      setUploadStatus(ERequestStatus.SUCCEEDED);
      setFiles([]);
      setFileName('');
      setError('');
      setKeywords([]);
      setCount(0);
    } catch (err: any) {
      console.warn(err);
      setError(err?.message);
    }
  };
  useEffect(() => {
    dispatch(fetchKeywords());
  }, [dispatch]);

  return (
    <Row gutter={[16, 16]}>
      <Col lg={6} xs={24}>
        <Card title="Action">
          <div className="upload-form-header">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <div className="section-upload">
                {uploadStatus !== ERequestStatus.LOADING ? (
                  <>
                    <img
                      src="https://cdn.shopify.com/s/files/1/0530/9261/4298/files/VDC6-arrow-down.png?v=1649907827"
                      alt="arrow-down"
                    />
                    <p className="section-upload__description">
                      Drag and Drop, or click to upload.
                    </p>
                    <p>Allowed File Types: Microsolf Excel.xlsx</p>
                  </>
                ) : null}

                {fileName ? (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      alt="=asd"
                      src="https://cdn.shopify.com/s/files/1/0530/9261/4298/files/VDC6-document-icon.png?v=1649992114"
                      style={{ width: '50px' }}
                    />
                    <p style={{ margin: '4px 0 10px' }}>{fileName}</p>
                    <div style={{ display: 'flex' }}>
                      {uploadStatus === ERequestStatus.LOADING ? (
                        <CustomProgress
                          format={(percent) => `Crawl... ${percent}%`}
                          type="circle"
                          status="success"
                          showInfo
                          percent={Math.floor((count / keywords.length) * 100)}
                        />
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="upload-file-button">
              <button
                type="button"
                disabled={files.length === 0}
                className="vdc-button upload-employee"
                onClick={uploadFileToServer}
              >
                Start get link
              </button>
              <div>
                {error && (
                  <div className="upload-file__error">
                    <div className="upload-file__error--heading">
                      <img
                        src="https://cdn.shopify.com/s/files/1/0530/9261/4298/files/VDC6-error-icon.png?v=1650524833"
                        alt="error-icon"
                      />
                      <span>Error found</span>
                    </div>
                    <div>{error}</div>
                  </div>
                )}
              </div>
            </div>
            <div>
              {error && (
                <div className="upload-file__error">
                  <div className="upload-file__error--heading">
                    <img
                      src="https://cdn.shopify.com/s/files/1/0530/9261/4298/files/VDC6-error-icon.png?v=1650524833"
                      alt="error-icon"
                    />
                    <span>Error found</span>
                  </div>
                  <div>{error}</div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </Col>
      <Col lg={18} xs={24}>
        <Table
          dataSource={keywordList}
          loading={keywordStatus === ERequestStatus.LOADING}
          size="middle"
        >
          <Table.Column title="ID" width="25%" dataIndex="id" key="id" />
          <Table.Column
            title="Keyword"
            width="25%"
            dataIndex="keyword"
            key="keyword"
            filterOnClose
          />
          <Table.Column
            title="Links"
            width="50%"
            ellipsis
            key="links"
            render={(keyword: IKeyword) => (
              <>
                {keyword.links.map((link) => (
                  <div key={generateRandomString(12)}>
                    <a href={link} target="_blank" rel="noreferrer">
                      {link}
                    </a>
                  </div>
                ))}
              </>
            )}
          />
        </Table>
      </Col>
    </Row>
  );
};

export default Home;
