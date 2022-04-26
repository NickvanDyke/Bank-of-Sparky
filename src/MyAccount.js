import styled from "@emotion/styled"
import { Button, LinearProgress, TextField, Tooltip } from "@mui/material"
import { ethers } from "ethers"
import { BankOfSparky, ellipsizeAddress, Provider } from "./App"
import { Card } from "./Card"

const { useContext, useState, useEffect, useCallback } = require("react")

export const MyAccount = () => {
    const provider = useContext(Provider)
    const bankOfSparky = useContext(BankOfSparky)

    const [account, setAccount] = useState(null)
    const [isLoadingBalance, setLoadingBalance] = useState(true)
    const [balance, setBalance] = useState(null)

    const [amt, setAmt] = useState("")
    const [desc, setDesc] = useState("")
    const [isSending, setSending] = useState(false)

    useEffect(() => {
        provider.getSigner().getAddress()
            .then((address) => { setAccount(address) })
    }, [provider, setAccount])

    useEffect(() => {
        if (account && isLoadingBalance) {
            bankOfSparky.balances(account)
                .then((balance) => {
                    setBalance(balance)
                    setLoadingBalance(false)
                })
        }
    }, [account, bankOfSparky, isLoadingBalance, setLoadingBalance, setBalance])

    useEffect(() => {
        if (account) {
            bankOfSparky.on(bankOfSparky.filters.Deposit(account, null, null), (account, amt, desc) => { setLoadingBalance(true) })
            bankOfSparky.on(bankOfSparky.filters.Withdrawal(account, null, null), (account, amt, desc) => { setLoadingBalance(true) })

            return () => { bankOfSparky.removeAllListeners() }
        }

    }, [bankOfSparky, account, setLoadingBalance])

    const areButtonsEnabled = amt !== "" && desc !== "" && !isSending

    // How can I share logic between these callbacks?
    const deposit = useCallback(async () => {
        if (isSending)
            return;

        setSending(true)
        try {
            const tx = await bankOfSparky.deposit(desc, { value: ethers.utils.parseEther(amt) })
            await tx.wait()
            setLoadingBalance(true)
            setAmt("")
            setDesc("")
        } catch (e) {
            window.alert(e.message)
        }
        setSending(false)
    }, [desc, amt, setDesc, setAmt, bankOfSparky, isSending, setLoadingBalance])

    const withdraw = useCallback(async () => {
        if (isSending)
            return;

        setSending(true)
        try {
            const tx = await bankOfSparky.withdraw(ethers.utils.parseEther(amt), desc)
            await tx.wait()
            setLoadingBalance(true)
            setAmt("")
            setDesc("")
        } catch (e) {
            window.alert(e.message)
        }
        setSending(false)
    }, [desc, amt, setDesc, setAmt, bankOfSparky, isSending, setLoadingBalance])

    return (
        <MyAccountContainer>
            <Balance>{(balance === null ? "..." : ethers.utils.formatEther(balance)) + " ETH"}</Balance>
            <Tooltip title={account == null ? "" : account}>
                <MyAddress>{ellipsizeAddress(account)}</MyAddress>
            </Tooltip>
            <Amount
                variant="outlined"
                label="Amount"
                type="number"
                value={amt}
                onChange={event => setAmt(event.target.value)}
            />
            <Description
                variant="outlined"
                label="Description"
                multiline={true}
                value={desc}
                onChange={event => setDesc(event.target.value)}
            />
            <ButtonContainer>
                <MyButton
                    variant="contained"
                    disabled={!areButtonsEnabled}
                    onClick={deposit}
                >
                    Deposit
                </MyButton>
                <MyButton
                    disabled={!areButtonsEnabled}
                    variant="contained"
                    onClick={withdraw}
                >
                    Withdraw
                </MyButton>
            </ButtonContainer>
            <LinearProgress style={{ visibility: isSending ? "visible" : "hidden" }} />
        </MyAccountContainer>
    )
}

const MyAccountContainer = styled(Card)`
    display: flex;
    flex-direction: column;
    flex: 1;
    grid-gap: 8px;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 16px;
    max-width: 250px;
`

const Balance = styled.div`
    font-size: 2em;
    align-self: center;
    font-weight: bold;
    color: black;
`

const MyAddress = styled.div`
    align-self: center;
    font-weight: lighter;
    margin-bottom: 8px;
`

const Amount = styled(TextField)`
`

const Description = styled(TextField)`
`

const ButtonContainer = styled.div`
    display: flex;
    grid-gap: 8px;
    margin-top: 8px;
    margin-bottom: 4px;
`

const MyButton = styled(Button)`
    flex-grow: 1;
`
