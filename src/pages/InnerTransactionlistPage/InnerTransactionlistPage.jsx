import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';

import { StandardTemplate } from 'templates';
import InnerTransactionlist from './components/Transactionlist';
import { PageTitleDivStyled } from 'styled';

class InnerTransactionlistPage extends Component {

  render() {

    return (
      <StandardTemplate>
        <div className="TransactionlistPage">
          <Row>
            <Col sm="12">
              <PageTitleDivStyled>Inner Transactions Page</PageTitleDivStyled>
            </Col>
          </Row>
          <Row>
            <Col sm="12">
            <InnerTransactionlist/>
            </Col>
          </Row>
        </div>
      </StandardTemplate>
    );
  }
}

export default InnerTransactionlistPage;
