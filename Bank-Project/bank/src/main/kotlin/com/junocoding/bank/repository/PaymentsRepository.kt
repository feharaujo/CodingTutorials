package com.junocoding.bank.repository

import com.junocoding.bank.model.Payment
import org.springframework.data.repository.CrudRepository
import java.util.*

interface PaymentsRepository: CrudRepository<Payment, UUID>
