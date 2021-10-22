package com.junocoding.bank.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.junocoding.bank.controller.model.NewTransactionModel
import com.junocoding.bank.repository.TransactionDBModel
import com.junocoding.bank.repository.TransferRepository
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import java.util.*
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultHandlers.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*


@WebMvcTest
class PaymentsControllerTest(@Autowired val mockMvc: MockMvc) {

    @MockkBean
    private lateinit var paymentsRepository: TransferRepository

    @Test
    fun `should get payment with success`() {
        val mockTransaction = mockk<TransactionDBModel>().apply {
            every { value } returns 1.50
            every { description } returns "store 1"
            every { accountIdentifier } returns "NL47INGB8845464385"
            every { date } returns Date()
            every { id } returns UUID.randomUUID()
        }

        every { paymentsRepository.findAll() } returns listOf(mockTransaction)

        mockMvc.perform(get("/payments/all").accept(MediaType.APPLICATION_JSON))
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("\$.[0].description").value("store 1"))
    }

    @Test
    fun `should submit payment with success`() {
        val transfer = NewTransactionModel(
            value = 1.50,
            description = "store 1",
            targetAccount = "NL76ABNA2376059879"
        )

        every { paymentsRepository.save(any()) } returns mockk()

        mockMvc.perform(post("/payments/new")
            .content(ObjectMapper().writeValueAsString(transfer))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
            .andDo(print())
            .andExpect(status().isOk)
    }

    @Test
    fun `should return a bad request error`() {
        mockMvc.perform(post("/payments/new")
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
            .andDo(print())
            .andExpect(status().is4xxClientError)
    }

}