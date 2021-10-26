package com.junocoding.bank.repository

import com.junocoding.bank.repository.model.TransactionDBModel
import org.springframework.data.repository.CrudRepository
import java.util.*

interface TransferRepository: CrudRepository<TransactionDBModel, UUID>
