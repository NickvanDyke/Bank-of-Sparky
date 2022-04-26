import styled from "@emotion/styled";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { useContext, useEffect, useState } from "react";
import { Provider, BankOfSparky } from "./App";

export const BankHeader = () => {
    const bankOfSparky = useContext(BankOfSparky)
    const provider = useContext(Provider)

    const [accounts, setAccounts] = useState([])
    const [bankBalance, setBankBalance] = useState(BigNumber.from("0"))
    const [isLoadingAccounts, setLoadingAccounts] = useState(true)
    const [isLoadingBankBalance, setLoadingBankBalance] = useState(true)

    // TODO listen for deposit events to detect new accounts
    // (or emit a dedicated event for it?)
    useEffect(() => {
        if (isLoadingAccounts) {
            bankOfSparky.allAccounts()
                .then(accounts => {
                    setAccounts(accounts)
                    setLoadingAccounts(false)
                })
        }
    }, [bankOfSparky, isLoadingAccounts])

    useEffect(() => {
        bankOfSparky.on("Deposit", () => { setLoadingBankBalance(true); setLoadingAccounts(true) })
        bankOfSparky.on("Withdrawal", () => { setLoadingBankBalance(true); setLoadingAccounts(true) })

		return () => { bankOfSparky.removeAllListeners() }
    }, [bankOfSparky, setLoadingBankBalance, setLoadingAccounts])

    useEffect(() => {
        if (isLoadingBankBalance) {
            provider.getBalance(bankOfSparky.address)
                .then(bankBalance => {
                    setBankBalance(formatUnits(bankBalance))
                    setLoadingBankBalance(false)
                })
        }
    }, [provider, bankOfSparky, isLoadingBankBalance, setLoadingBankBalance, setBankBalance])

    return (
        <Container>
            <BankName>Bank of Sparky</BankName>
            <Stats>{`${accounts.length} big brain bankers stupidly storing ${bankBalance} ETH`}</Stats>
        </Container>
    )
}

// TODO how to horizontally center when wrapping?
const Container = styled.div`
    display: flex;
    flex-direction: column;
    color: white;
`

const BankName = styled.div`
    font-size: 3em;
    font-weight: bold;
    font-variant: small-caps;
`

const Stats = styled.div`
    font-style: italic;
`