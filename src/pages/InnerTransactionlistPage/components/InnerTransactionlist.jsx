import React, {Component} from 'react';


import {Button, CardBody, CardTitle, Col, Row} from 'reactstrap';
import styled from 'styled-components';
import isObjectEmpty from 'helpers/is-object-empty';
import {CardHeaderStyled, CardStyled, InputStyled, TableStyled} from 'styled';


const FirstCardStyled = styled(CardStyled)`
  border-top: solid 2px #1173a4;
`

const DivFlexStyled = styled.div`
  display: flex;
  justify-content: flex-end;
`
const SearchInputStyled = styled(InputStyled)`
  width: 38%;
  margin-right: 10px;
`

class InnerTransactionlist extends Component {
  timerId = null;

  state = {
    payload: [],
    error: null,
    isPolling: false,
    limit: 10,
    page: 0
  };

  handleNext = () => {
    if (this.state.payload.length === 0) return;
    this.setState({page: this.state.page + 1}, this.getHistory)
  }

  handlePrev = () => {
    if (this.state.page === 0) return;
    this.setState({page: this.state.page - 1}, this.getHistory)
  }


  getHistory(isTimer) {
    if (isTimer && this.state.page > 0) return;

    let lower_bound = null;
    let upper_bound = null;
    if (this.state.page > 0 && this.state.lastIndex) {
      lower_bound = this.state.lastIndex - this.state.page * this.state.limit - this.state.limit;
      upper_bound = this.state.lastIndex - this.state.page * this.state.limit;
    }

    this.setState({isPolling: true});
    window.$.ajax({
      url: window._env_.NODE_PATH + "/v1/chain/get_table_rows",
      method: "POST",
      data: JSON.stringify({
        json: true,
        code: "tokenlock",
        scope: "tokenlock",
        reverse: true,
        table: 'history',
        limit: this.state.limit,
        lower_bound: lower_bound,
        upper_bound: upper_bound
      }),
      success: (r) => {
        const st = {payload: r.rows};
        if (this.state.page === 0 && r.rows.length > 0) {
          st.lastIndex = r.rows[0].id;
        }
        this.setState(st, () => {
          this.setState({isPolling: false});
        });
      },
      error: (r) => {
        this.setState({error: r.responseText}, () => {
          this.setState({isPolling: false});
        });
      }
    });
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  componentWillMount() {
    this.getHistory();
    this.timerId = setInterval(() => this.getHistory(true), 2000);
  }


  render() {

//    const [inputValue, setInputValue] = {inputValue:"", setInputValue:""};

    let {payload = [], error, isPolling, inputValue} = this.state;

    return (
      <div className="Transactionlist">
        <FirstCardStyled>
          <CardHeaderStyled>Inner Transaction List</CardHeaderStyled>
          <CardBody>
            <CardTitle>
              {/*<DivFlexStyled>*/}
              {/*  <SearchInputStyled*/}
              {/*    placeholder="Transaction ID"*/}
              {/*    value={inputValue}*/}
              {/*    onKeyDown={*/}
              {/*      evt => {*/}
              {/*        // if (evt.key === 'Enter') {*/}
              {/*        //   setInputValue("");*/}
              {/*        //   if (inputValue !== "")*/}
              {/*        //     props.push('/transaction/' + inputValue)*/}
              {/*        // }*/}
              {/*      }*/}
              {/*    }*/}
              {/*    onChange={evt => {*/}
              {/*      // setInputValue(evt.target.value)*/}
              {/*    }}/>*/}
              {/*  <ButtonPrimary*/}
              {/*    onClick={evt => {*/}
              {/*      // setInputValue("");*/}
              {/*      // if (inputValue !== "")*/}
              {/*      //   props.push('/transaction/' + inputValue)*/}
              {/*    }}>*/}
              {/*    SEARCH</ButtonPrimary>*/}
              {/*</DivFlexStyled>*/}
            </CardTitle>

            <div>{error
              ?
              <>
                {!isObjectEmpty(error) && <p className="text-danger">{JSON.stringify(error)}</p>}
              </>
              :
              <Row>
                <Col xs="12">
                  <TableStyled borderless>
                    <thead>
                    <tr>
                      <th width="5%">ID</th>
                      <th width="5%">LockID</th>
                      <th width="5%">ParentID</th>
                      <th width="20%">Username</th>
                      <th width="25%">Amount</th>
                      <th width="5%">Alg</th>
                      <th width="30%">Created</th>
                    </tr>
                    </thead>
                    <tbody className="hashText">
                    {(payload.length < 1)
                      ? <tr>
                        <td colSpan="7" className="text-center">No transactions found</td>
                      </tr>
                      : payload.map((tr, index) =>
                        <tr key={index}>
                          <td>{tr.id}</td>
                          <td>{tr.lock_id}</td>
                          <td>{tr.lock_parent_id}</td>
                          <td>{tr.username}</td>
                          <td>{tr.amount}</td>
                          <td>{tr.algorithm}</td>
                          <td>{tr.created}</td>
                        </tr>)}
                    </tbody>
                  </TableStyled>
                </Col>
                <Col xs="12" className="text-right">
                  <Button disabled={this.state.page <= 0} outline color="primary"
                          onClick={this.handlePrev}>Back</Button>{' '}
                  <Button disabled={payload.length <= 0} outline color="primary" onClick={this.handleNext}>Next</Button>
                </Col>
              </Row>
            }
            </div>
          </CardBody>
        </FirstCardStyled>
      </div>
    );
  }
}

export default InnerTransactionlist;


