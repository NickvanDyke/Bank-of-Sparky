import { BankOfSparky, ellipsizeAddress } from "./App"
import { useContext, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { ethers } from "ethers";
import { Tooltip } from "@mui/material";
import { BottomContainerRow } from "./BottomContainerRow";

export const Account = ({ account }) => {
	const bankOfSparky = useContext(BankOfSparky)
    const [isLoadingBalance, setLoadingBalance] = useState(true)
	const [balance, setBalance] = useState(null)

    useEffect(() => {
        if (isLoadingBalance) {
            bankOfSparky.balances(account)
                .then((balance) => {
                    setBalance(balance)
                    setLoadingBalance(false)
                })
        }
    }, [account, bankOfSparky, isLoadingBalance, setLoadingBalance, setBalance])

    useEffect(() => {
        bankOfSparky.on(bankOfSparky.filters.Deposit(account), () => { setLoadingBalance(true) })
        bankOfSparky.on(bankOfSparky.filters.Withdrawal(account), () => { setLoadingBalance(true) })

		return () => { bankOfSparky.removeAllListeners() }
    }, [bankOfSparky, account, setLoadingBalance])

	return (
		<AccountContainer>
			<Tooltip title={account}>
				<Address>{ellipsizeAddress(account)}</Address>
			</Tooltip>
			<Balance>{(balance === null ? "..." : ethers.utils.formatEther(balance)) + " ETH"}</Balance>
		</AccountContainer>
	)
}

const AccountContainer = styled(BottomContainerRow)`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	flex-wrap: wrap;
	column-gap: 1em;
`

const Address = styled.div`
	/* font-style: italic; */
	overflow: hidden;
`

const Balance = styled.div`
	font-weight: bold;
`