import React, {Component, useEffect, useState} from 'react';

import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {fetchStart, paramsSet} from './AccountdetailReducer';
import pathNameConsumer from 'helpers/pathname-consumer';
import {push} from 'connected-react-router'

import {Button, CardBody, Col, Form, FormGroup, Row} from 'reactstrap';
import styled from 'styled-components';
import {CodeViewer, LoadingSpinner} from 'components';
import {ButtonPrimary, CardHeaderStyled, CardStyled, ErrorDivStyled, InputStyled, TableStyled} from 'styled';


const FirstCardStyled = styled(CardStyled)`
  border-top: solid 2px #1173a4;
`
const SearchInputStyled = styled(InputStyled)`
  width: 38%;
  margin-right: 10px;
`
const DivFlexStyled = styled.div`
  display: flex;
  justify-content: flex-end;
`
const CustomErrorDiv = styled(ErrorDivStyled)`
  padding: 30px 0 0 0;
`


class AccountBalance extends Component {
  state = {
    balances: {USDU: "0.0000 USDU", CRU: "0.0000 CRU", UNTB: "0.0000 UNTB",},
    total: ""
  };


  getBalance(symbol) {
    window.$.ajax({
      url: window._env_.NODE_PATH + "/v1/chain/get_currency_balance",
      method: "POST",
      data: JSON.stringify({
        "code": "eosio.token",
        "account": this.props.accountName,
        "symbol": symbol
      }),
      success: (r) => {
        this.setState({balances: {...this.state.balances, [symbol]: r ? r : `0.0000 ${symbol}`}});
      }
    });
  }

  getStats(symbol) {
    window.$.ajax({
      url: window._env_.NODE_PATH + "/v1/chain/get_currency_stats",
      method: "POST",
      data: JSON.stringify({
        "code": "eosio.token",
        "account": "reserve",
        "symbol": symbol
      }),
      success: (r) => {
        this.setState({total: r.CRU.supply});
      }
    });
  }

  componentWillMount() {
    this.getStats("CRU");
    this.getBalance("CRU");
    this.getBalance("UNTB");
  }

  render() {
    return (
      <div>
        <FormGroup row>
          <Col sm={2}>Total Supply:</Col>
          <Col sm={10} className="hashText">{this.state.total}</Col>
        </FormGroup>
        {Object.keys(this.state.balances).map((key) => {
          return <FormGroup key={key} row>
            <Col sm={2}>{key}:</Col>
            <Col sm={10} className="hashText">
              {this.state.balances[key]}
            </Col>
          </FormGroup>
        })}
      </div>
    );
  }
}


class AccountHistory extends Component {
  state = {
    history: [],
    limit: 10,
    page: 0
  };


  handleNext = () => {
    if (this.state.history.length === 0) return;
    this.setState({page: this.state.page + 1}, this.getHistory)
  }

  handlePrev = () => {
    if (this.state.page === 0) return;
    this.setState({page: this.state.page - 1}, this.getHistory)
  }

  getHistory() {
    let lower_bound = null;
    let upper_bound = null;
    if (this.state.page > 0 && this.state.lastIndex) {
      lower_bound = this.state.lastIndex - this.state.page * this.state.limit - this.state.limit;
      upper_bound = this.state.lastIndex - this.state.page * this.state.limit;
    }
    if (lower_bound < 0){
      lower_bound = 0;
    }
    if (upper_bound < 0){
      upper_bound = 0;
    }

    window.$.ajax({
      url: window._env_.NODE_PATH + "/v1/chain/get_table_rows",
      method: "POST",
      data: JSON.stringify({
        json: true,
        code: "tokenlock",
        scope: this.props.accountName,
        reverse: true,
        table: 'history',
        limit: this.state.limit,
        lower_bound: lower_bound,
        upper_bound: upper_bound
      }),
      success: (r) => {
        const st = {history: r.rows};
        if (this.state.page === 0 && r.rows.length > 0) {
          st.lastIndex = r.rows[0].id;
        }
        this.setState(st);
      }
    });
  }

  componentWillMount() {
    this.getHistory(0, 9, 10);
  }

  render() {
    const payload = this.state.history;
    return (
      <div>
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
      </div>
    );
  }
}

class LockHistory extends Component {
  state = {
    locks: [],
  };

  getLocks() {
    window.$.ajax({
      url: window._env_.NODE_PATH + "/v1/chain/get_table_rows",
      method: "POST",
      data: JSON.stringify({
        json: true,
        "code": "tokenlock",
        reverse: true,
        "scope": this.props.accountName,
        table: 'locks',
      }),
      success: (r) => {
        this.setState({locks: [...this.state.locks, ...r.rows]});
      }
    });
  }

  componentWillMount() {
    this.getLocks();
  }

  render() {
    const payload = this.state.locks;
    return (
      <div>
        <Row>
          <Col xs="12">
            <TableStyled borderless>
              <thead>
              <tr>
                <th width="5%">ID</th>
                <th>Amount</th>
                <th>Withdrawed</th>
                <th>Available</th>
                <th width="5%">Alg</th>
                <th>Distribution</th>
                <th>Created</th>
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
                    <td>{tr.amount}</td>
                    <td>{tr.withdrawed}</td>
                    <td>{tr.available}</td>
                    <td>{tr.algorithm}</td>
                    <td>{tr.last_distribution_at}</td>
                    <td>{tr.created}</td>
                  </tr>)}
              </tbody>
            </TableStyled>
          </Col>
        </Row>
      </div>
    );
  }
}

const Accountdetail = (props) => {

  const [inputValue, setInputValue] = useState("");
  const [showDetailsSection, setShowDetailsSection] = useState(false);

  useEffect(() => {
    let {router: {location: {pathname}}} = props;
    if (pathname === '/account' || pathname === '/account/') {
      setShowDetailsSection(false);
    } else {
      setShowDetailsSection(true)
      props.paramsSet({account_name: pathNameConsumer(pathname)});
      props.fetchStart();
    }
  }, [])

  let {accountdetail: {isFetching, data, contractData, params}} = props;
  let {payload = {}, error} = data;
  let {contractPayload = {}} = contractData;

  return (
    <div className="Accountdetail">
      <Row>
        <Col sm="12">
          <FirstCardStyled>
            <CardHeaderStyled>Search Account</CardHeaderStyled>
            <CardBody>
              <DivFlexStyled>
                <SearchInputStyled
                  placeholder="Account Name"
                  value={inputValue}
                  onKeyDown={
                    evt => {
                      if (evt.key === 'Enter') {
                        setInputValue("")
                        if (inputValue !== "")
                          props.push('/account/' + inputValue)
                      }
                    }
                  }
                  onChange={evt => {
                    setInputValue(evt.target.value)
                  }}/>
                <ButtonPrimary
                  onClick={evt => {
                    setInputValue("")
                    if (inputValue !== "")
                      props.push('/account/' + inputValue)
                  }}>
                  SEARCH</ButtonPrimary>
              </DivFlexStyled>
            </CardBody>
          </FirstCardStyled>
        </Col>
      </Row>
      <div>
        {showDetailsSection &&
        <div>
          {error
            ? <CustomErrorDiv>No Account found with Account Name {params.account_name}</CustomErrorDiv>
            : isFetching
              ? <LoadingSpinner/>
              : (Object.keys(payload).length === 0 && payload.constructor === Object)
                ? <LoadingSpinner/>
                : <div>
                  <Row>
                    <Col sm="12">
                      <CardStyled>
                        <CardHeaderStyled>Account Detail</CardHeaderStyled>
                        <CardBody>
                          <Form>
                            <FormGroup row>
                              <Col sm={2}>Account Name:</Col>
                              <Col sm={10} className="hashText">
                                {payload.account_name}
                              </Col>
                            </FormGroup>
                            <FormGroup row>
                              <Col sm={2}>Account Creation Date:</Col>
                              <Col sm={10} className="hashText">
                                {payload.created}
                              </Col>
                            </FormGroup>
                            <FormGroup row>
                              <Col sm={2}>Owner Public Key:</Col>
                              <Col sm={10} className="hashText">
                                {payload.permissions &&
                                payload.permissions[0].perm_name === "owner"
                                  ? payload.permissions[0].required_auth.keys.length > 0
                                    ? payload.permissions[0].required_auth.keys[0].key
                                    : "No Public Key"
                                  : payload.permissions && payload.permissions[1].required_auth.keys.length > 0
                                    ? payload.permissions[1].required_auth.keys[0].key
                                    : "No Public Key"
                                }
                              </Col>
                            </FormGroup>
                            <FormGroup row>
                              <Col sm={2}>Active Public Key:</Col>
                              <Col sm={10} className="hashText">
                                {payload.permissions &&
                                payload.permissions[0].perm_name === "active"
                                  ? payload.permissions[0].required_auth.keys.length > 0
                                    ? payload.permissions[0].required_auth.keys[0].key
                                    : "No Public Key"
                                  : payload.permissions && payload.permissions[1].required_auth.keys.length > 0
                                    ? payload.permissions[1].required_auth.keys[0].key
                                    : "No Public Key"
                                }
                              </Col>
                            </FormGroup>
                            {(contractPayload.hasOwnProperty("abi") === false)
                              ? <FormGroup row>
                                <Col sm={2}>Smart Contract:</Col>
                                <Col sm={10} className="hashText"> No Smart
                                  Contract </Col>
                              </FormGroup>
                              : <FormGroup row>
                                <Col sm={2}>Smart Contract:</Col>
                                <Col sm={10} className="hashText">
                                  <Link
                                    to={`/contract/${contractPayload.account_name}`}>
                                    {contractPayload.account_name}
                                  </Link>
                                </Col>
                              </FormGroup>
                            }
                          </Form>
                        </CardBody>
                      </CardStyled>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm="12">
                      <CardStyled>
                        <CardHeaderStyled>Balances</CardHeaderStyled>
                        <CardBody>
                          <AccountBalance accountName={params.account_name}/>
                        </CardBody>
                      </CardStyled>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm="12">
                      <CardStyled>
                        <CardHeaderStyled>Transaction History</CardHeaderStyled>
                        <CardBody>
                          <AccountHistory accountName={params.account_name}/>
                        </CardBody>
                      </CardStyled>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm="12">
                      <CardStyled>
                        <CardHeaderStyled>Locks</CardHeaderStyled>
                        <CardBody>
                          <LockHistory accountName={params.account_name}/>
                        </CardBody>
                      </CardStyled>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm="12">
                      <CardStyled>
                        <CardHeaderStyled>Account Raw JSON</CardHeaderStyled>
                        <CardBody>
                          <CodeViewer
                            language="json"
                            value={JSON.stringify(payload, null, 2)}
                            readOnly={true}
                            height={600}
                          />
                        </CardBody>
                      </CardStyled>
                    </Col>
                  </Row>
                </div>
          }
        </div>
        }
      </div>
    </div>
  );
}

export default connect(
  ({accountdetailPage: {accountdetail}, router}) => ({
    accountdetail,
    router
  }),
  {
    fetchStart,
    paramsSet,
    push
  }
)(Accountdetail);
